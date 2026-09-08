// Package llm - llama related code
package llm

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
	"strings"
	"time"

	"github.com/firebase/genkit/go/plugins/compat_oai"
)

const (
	provider     = "llamacpp"
	llamaBaseURL = "http://127.0.0.1:8001/v1"
)

type ModelSSE struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Event    string `json:"event"`
	Data     struct {
		Status string `json:"status"`
	} `json:"data"`
}

type LlamaServerError struct {
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error"`
}

type Llama struct {
	compat_oai.OpenAICompatible

	SSEListenerEnabled bool
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

		l.SSEListenerEnabled = true
		for scanner.Scan() {
			if ctx.Err() != nil {
				resp.Body.Close()
				l.SSEListenerEnabled = false
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
			l.SSEListenerEnabled = false
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

func (l *Llama) Name() string {
	return provider
}

func (l *Llama) Load(model string) error {
	var responseBody LlamaServerError
	url := fmt.Sprintf("%s/models/load", l.BaseURL)
	body := map[string]string{
		"model": model,
	}
	statusCode, err := post(url, body, &responseBody)
	if err != nil {
		return err
	}

	logger.GetInstance().Debug(fmt.Sprintf("llama (load model): %+v\n", responseBody))
	if statusCode == 200 {
		return nil
	}

	return errors.New(responseBody.Error.Message)
}

func (l *Llama) Unload(model string) error {
	var responseBody LlamaServerError
	url := fmt.Sprintf("%s/models/unload", l.BaseURL)
	body := map[string]string{
		"model": model,
	}
	statusCode, err := post(url, body, &responseBody)
	if err != nil {
		return err
	}

	logger.GetInstance().Debug(fmt.Sprintf("llama (unload model): %+v\n", responseBody))
	if statusCode == 200 {
		return nil
	}

	return errors.New(responseBody.Error.Message)
}

type LlamaModelMeta struct {
	ID      string   `json:"id"`
	Aliases []string `json:"aliases"`
	Tags    []string `json:"tags"`
	Object  string   `json:"object"`
	OwnedBy string   `json:"owned_by"`
	Created int64    `json:"created"`
	Status  struct {
		Value  string   `json:"value"`
		Args   []string `json:"args"`
		Preset string   `json:"preset"`
	} `json:"status"`
	Architecture struct {
		InputModalities  []string `json:"input_modalities"`
		OutputModalities []string `json:"output_modalities"`
	} `json:"architecture"`
	NeedDownload bool `json:"need_download"`
}

type LlamaAPIModels struct {
	Data   []LlamaModelMeta `json:"data"`
	Object string           `json:"object"`
}

func ListLlamaModels(url string) []Model {
	var body LlamaAPIModels
	models := []Model{}

	statusCode, err := get(url, &body)
	if err != nil {
		logger.GetInstance().Error(fmt.Sprintf("get request was unsuccesfull: %s\n", err.Error()))
		return nil
	}

	if statusCode != 200 {
		logger.GetInstance().Error("(ListllamaModels) provider request was unsuccesfull")
		return nil
	}

	for _, m := range body.Data {
		models = append(models, Model{
			ID:     m.ID,
			Status: m.Status.Value,
		})
	}

	return models
}

func getLlamaPlugin(ctx context.Context) *Llama {
	llama := &Llama{
		SSEListenerEnabled: false,
	}
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
