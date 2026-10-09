package providers

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"server/internal/logger"
	"server/internal/notification"
	"server/internal/utils"
	"strings"
	"sync/atomic"
	"time"

	"github.com/firebase/genkit/go/plugins/compat_oai"
)

const (
	provider     = "llamacpp"
	llamaBaseURL = "http://127.0.0.1:8001/v1"
)

type Llama struct {
	compat_oai.OpenAICompatible

	sseDone      chan struct{}
	sseConnected atomic.Bool
}

func InitLlama(ctx context.Context) *Llama {
	llama := new(Llama)

	url := os.Getenv("LLAMA_URL")
	if url == "" {
		logger.GetInstance().Warn(fmt.Sprintf("llama server url not found from environment. Set to fallback url (%s)\n", llamaBaseURL))
		url = llamaBaseURL
	}

	llama.BaseURL = url
	llama.Provider = provider
	go llama.ListenSSE(ctx)

	return llama
}

func (m *Llama) Name() string {
	return provider
}

func (m *Llama) GetMetaInfo() ProviderMeta {
	api := fmt.Sprintf("%s/health", m.BaseURL)
	statusCode, err := utils.GetRequest[any](api, nil)

	if err != nil {
		logger.GetInstance().Warn(fmt.Sprintf("could not check provider availability: %s", err.Error()))
	}

	return ProviderMeta{
		Name:      provider,
		Addr:      m.BaseURL,
		Available: statusCode == http.StatusOK,
	}
}

func (m *Llama) ListModels() ([]ProviderModelMeta, error) {
	var requestBody LlamaAPIModels
	models := []ProviderModelMeta{}

	api := fmt.Sprintf("%s/models", m.BaseURL)
	statusCode, err := utils.GetRequest(api, &requestBody)
	if err != nil {
		return nil, err
	}

	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("service (%s) returned error with status code of %d", provider, statusCode)
	}

	for _, m := range requestBody.Data {
		models = append(models, ProviderModelMeta{
			ID:     m.ID,
			Status: m.Status.Value,
		})
	}

	return models, nil
}

func (m *Llama) EnableModel(modelName string) error {
	var responseBody LlamaServerError
	url := fmt.Sprintf("%s/models/load", m.BaseURL)
	body := map[string]string{
		"model": modelName,
	}
	statusCode, err := utils.PostRequest(url, body, &responseBody)
	if err != nil {
		return err
	}

	logger.GetInstance().Debug(fmt.Sprintf("llama (load model): %+v\n", responseBody))
	if statusCode == 200 {
		return nil
	}

	return errors.New(responseBody.Error.Message)
}

func (m *Llama) DisableModel(modelName string) error {
	var responseBody LlamaServerError
	url := fmt.Sprintf("%s/models/unload", m.BaseURL)
	body := map[string]string{
		"model": modelName,
	}
	statusCode, err := utils.PostRequest(url, body, &responseBody)
	if err != nil {
		return err
	}

	logger.GetInstance().Debug(fmt.Sprintf("llama (unload model): %+v\n", responseBody))
	if statusCode == 200 {
		return nil
	}

	return errors.New(responseBody.Error.Message)
}

func (m *Llama) IsEnabled(modelName string) (bool, error) {
	models, err := m.ListModels()
	if err != nil {
		return false, err
	}

	for _, model := range models {
		if model.ID == modelName {
			return model.Status == "loaded", nil
		}
	}

	return false, errors.New("given model name is not found in the system")
}

func (l *Llama) ListenSSE(ctx context.Context) {
	url := fmt.Sprintf("%s/models/sse", l.BaseURL)
	client := &http.Client{}
	backoff := time.Second

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) unable initialize http request", l.Name()))
		logger.GetInstance().Error(err.Error())
		return
	}
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")

	for {
		if ctx.Err() != nil {
			return
		}

		resp, err := client.Do(req)
		if err != nil {
			logger.GetInstance().Error(fmt.Sprintf("Provider (%s) unable make http request", l.Name()))
			logger.GetInstance().Error(err.Error())
			if !waitBackoff(ctx, &backoff) {
				return
			}
			continue
		}

		if resp.StatusCode != http.StatusOK {
			logger.GetInstance().Error(fmt.Sprintf("Provider (%s) returned non-200 status code: %d", l.Name(), resp.StatusCode))
			resp.Body.Close()
			if !waitBackoff(ctx, &backoff) {
				return
			}
			continue
		}

		backoff = time.Second

		scanner := bufio.NewScanner(resp.Body)
		scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

		for scanner.Scan() {
			if ctx.Err() != nil {
				resp.Body.Close()
				return
			}

			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, ":") || !strings.HasPrefix(line, "data:") {
				continue
			}

			payload := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
			if payload == "" || payload == "[DONE]" {
				continue
			}

			var data ModelSSE
			if err := json.Unmarshal([]byte(payload), &data); err != nil {
				logger.GetInstance().Error(fmt.Sprintf("Provider (%s) invalid sse body: %s", l.Name(), payload))
				continue
			}

			instance := notification.GetInstance()
			if instance == nil {
				logger.GetInstance().Error("notification service not initialized")
				continue
			}

			data.Provider = l.Provider
			logger.GetInstance().Debug(fmt.Sprintf("Llama (SSE): %+v", data))
			instance.Send(notification.Payload{
				Type:    notification.NotificationLLMStatusChange,
				Content: data,
			})
		}

		if err := scanner.Err(); err != nil && ctx.Err() == nil {
			logger.GetInstance().Error(fmt.Sprintf("Provider (%s) scanner returned error", l.Name()))
			logger.GetInstance().Error(err.Error())
		}

		resp.Body.Close()

		if !waitBackoff(ctx, &backoff) {
			return
		}
	}
}

func waitBackoff(ctx context.Context, backoff *time.Duration) bool {
	select {
	case <-ctx.Done():
		return false
	case <-time.After(*backoff):
	}
	if *backoff < 10*time.Second {
		*backoff *= 2
	}
	return true
}
