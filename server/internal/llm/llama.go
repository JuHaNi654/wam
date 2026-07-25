// Package llm - llama related code
package llm

import (
	"context"
	"errors"
	"fmt"
	"os"

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

func (l *Llama) Name() string {
	return provider
}

func (l *Llama) Init(ctx context.Context) []api.Action {
	url := os.Getenv("LLAMA_URL")
	if url == "" {
		fmt.Printf("llama server url not found from environment. Set to fallback url (%s)\n", llamaBaseURL)
		url = llamaBaseURL
	}

	l.BaseURL = url
	l.Opts = append([]option.RequestOption{option.WithBaseURL(url)}, l.Opts...)
	l.openAiCompatible.Opts = l.Opts
	compatActions := l.openAiCompatible.Init(ctx)

	var actions []api.Action
	actions = append(actions, compatActions...)

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

	fmt.Printf("llama (load model): %+v\n", responseBody)
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

	fmt.Printf("llama (unload model): %+v\n", responseBody)
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
		fmt.Printf("get request was unsuccesfull: %s\n", err.Error())
		return nil
	}

	if statusCode != 200 {
		fmt.Println("provider request was unsuccesfull")
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
