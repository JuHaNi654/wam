// Package ai - ollama related code
package ai

import (
	"fmt"

	"github.com/firebase/genkit/go/plugins/ollama"
)

type OllamaModelMeta struct {
	Name          string `json:"name"`
	Model         string `json:"model"`
	Size          int64  `json:"size"`
	Digest        string `json:"digest"`
	ExpiresAt     string `json:"expires_at"`
	SizeVram      int64  `json:"size_vram"`
	ContextLength int64  `json:"context_length"`
	Details       struct {
		ParentModel       string   `json:"parent_model"`
		Format            string   `json:"format"`
		Family            string   `json:"family"`
		Families          []string `json:"families"`
		ParameterSize     string   `json:"parameter_size"`
		QuantizationLevel string   `json:"quantization_level"`
	} `json:"details"`
}

type OllamaModels struct {
	Models []OllamaModelMeta `json:"models"`
}

func getOllamaConfig() *ollama.Ollama {
	serverAddr, err := getEnvValue("OLLAMA_SERVER")
	if err != nil {
		fmt.Println(err)
		return nil
	}

	return &ollama.Ollama{
		ServerAddress: serverAddr,
		Timeout:       60,
	}
}
