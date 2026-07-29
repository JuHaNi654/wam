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

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core/api"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/compat_oai"
	"github.com/openai/openai-go/option"
)

const (
	provider     = "llama"
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
	Opts             []option.RequestOption
	openAiCompatible compat_oai.OpenAICompatible
	BaseURL          string
}

func (l *Llama) ListenSSE() {
	url := fmt.Sprintf("%s/models/sse", l.BaseURL)
	fmt.Println(url)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

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
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) unabled make http request", l.Name()))
		logger.GetInstance().Error(err.Error())
		return
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) returned non 200 status code", l.Name()))
		return
	}

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

		notification.Current.Send(notification.Payload{
			Type:    notification.NotificationLLMStatusChange,
			Content: data,
		})
	}

	if scanner.Err() != nil {
		logger.GetInstance().Error(fmt.Sprintf("Provider (%s) scanner  returned error", l.Name()))
	}
}

func (l *Llama) Name() string {
	return provider
}

func (l *Llama) Init(ctx context.Context) []api.Action {
	url := os.Getenv("LLAMA_URL")
	if url == "" {
		logger.GetInstance().Warn(fmt.Sprintf("llama server url not found from environment. Set to fallback url (%s)\n", llamaBaseURL))
		url = llamaBaseURL
	}

	l.BaseURL = url
	l.Opts = append([]option.RequestOption{option.WithBaseURL(url)}, l.Opts...)
	l.openAiCompatible.Opts = l.Opts
	compatActions := l.openAiCompatible.Init(ctx)

	var actions []api.Action
	actions = append(actions, compatActions...)

	go l.ListenSSE()
	return actions
}

func (l *Llama) Model(g *genkit.Genkit, id string) ai.Model {
	return l.openAiCompatible.Model(g, api.NewName(provider, id))
}

func (l *Llama) DefineModel(id string, opts ai.ModelOptions) ai.Model {
	return l.openAiCompatible.DefineModel(provider, id, opts)
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

func getLlamaPlugin() *Llama {
	return &Llama{}
}
