// Package ai - llama related code
package ai

import (
	"fmt"

	"github.com/firebase/genkit/go/plugins/ollama"
)

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

type LlamaModels struct {
	Data   []LlamaModelMeta `json:"data"`
	Object string           `json:"object"`
}

func getLlamaConfig() *ollama.Ollama {
	serverAddr, err := getEnvValue("LLAMA_SERVER")
	if err != nil {
		fmt.Println(err)
		return nil
	}

	return &ollama.Ollama{
		ServerAddress: serverAddr,
		Timeout:       60,
	}
}
