// Package llm - llama related code
package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"server/internal/logger"
	"server/internal/notification"

	"github.com/firebase/genkit/go/plugins/compat_oai"
)

const (
	provider     = "llamacpp"
	llamaBaseURL = "http://127.0.0.1:8001/v1"
)

type ModelSSE struct {
	Model string `json:"model"`
	Event string `json:"event"`
	Data  struct {
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

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) unabled initialize http request", l.Name()))
		logger.GetInstance().Error(err.Error())
		return
	}

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		// TODO: check other possible way to handle incoming cancel events
		if errors.Is(ctx.Err(), context.Canceled) {
			return
		}

		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) unabled make http request", l.Name()))
		logger.GetInstance().Error(err.Error())
		return
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) returned non 200 status code", l.Name()))
		return
	}

	l.SSEListenerEnabled = true
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		if len(scanner.Bytes()) == 0 {
			continue
		}

		payload := bytes.TrimPrefix(scanner.Bytes(), []byte("data: "))

		var data ModelSSE
		if err := json.Unmarshal(payload, &data); err != nil {
			logger.GetInstance().Error(fmt.Sprintf("Provider (%s) invalid sse body", l.Name()))
			continue
		}

		notification.GetInstance().Send(notification.Payload{
			Type:    notification.NotificationLLMStatusChange,
			Content: data,
		})
	}

	if scanner.Err() != nil && !errors.Is(ctx.Err(), context.Canceled) {
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) scanner  returned error", l.Name()))
		logger.GetInstance().Error(scanner.Err().Error())
	}
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
