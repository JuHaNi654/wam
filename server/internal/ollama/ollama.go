package ollama

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"strings"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
)

var InitializedOllama *OllamaModel

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

type PSResponse struct {
	Models []OllamaModelMeta `json:"models"`
}

type OllamaModel struct {
	Config      *ollama.Ollama
	model       ai.Model
	genkit      *genkit.Genkit
	ModelStatus OllamaModelMeta
}

func (m OllamaModel) Model() ai.Model {
	return m.model
}

func (m OllamaModel) Genkit() *genkit.Genkit {
	return m.genkit
}

func (m *OllamaModel) Ping() error {

	split := strings.Split(m.model.Name(), "/")
	url := fmt.Sprintf("%s/api/ps", m.Config.ServerAddress)
	resp, err := http.Get(url)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	var body PSResponse
	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		fmt.Println(err)
	}

	for _, item := range body.Models {
		if item.Name == split[1] {
			m.ModelStatus = item
		}
	}

	return nil
}

func Initalize(embed fs.FS) {
	ctx := context.Background()

	serverAddr, err := getEnvValue("OLLAMA_SERVER")
	if err != nil {
		fmt.Println(err)
		return
	}

	defaultModel, err := getEnvValue("OLLAMA_DEFAULT_MODEL")
	if err != nil {
		fmt.Println(err)
		return
	}

	config := &ollama.Ollama{
		ServerAddress: serverAddr,
		Timeout:       60,
	}

	g := genkit.Init(
		ctx,
		genkit.WithPlugins(config),
		genkit.WithPromptFS(embed),
	)

	InitializedOllama = &OllamaModel{
		Config: config,
		genkit: g,
		model: config.DefineModel(
			g,
			ollama.ModelDefinition{
				Name: defaultModel,
				Type: "chat",
			},
			&ai.ModelOptions{
				Supports: &ai.ModelSupports{
					Multiturn:  false,
					SystemRole: false,
					Tools:      false,
					Media:      false,
				},
			},
		),
	}
}

func getEnvValue(key string) (string, error) {
	value, isSet := os.LookupEnv(key)
	if !isSet {
		return "", fmt.Errorf("(%s) is not found in environment", key)
	}

	return value, nil
}
