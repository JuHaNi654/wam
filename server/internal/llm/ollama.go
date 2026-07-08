// Package llm - ollama related code
package llm

import (
	"os"

	"github.com/firebase/genkit/go/plugins/ollama"
)

var (
	ollamaBaseURL = "http://127.0.0.1:11434"
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

func getOllamaPlugin() *ollama.Ollama {
	url := os.Getenv("OLLAMA_URL")
	if url == "" {
		url = ollamaBaseURL
	}

	return &ollama.Ollama{
		ServerAddress: url,
		Timeout:       60,
	}
}
