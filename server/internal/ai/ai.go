package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"os"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
)

var InitializedAgent *Agent

type Agent struct {
	Config      *ollama.Ollama
	model       ai.Model
	genkit      *genkit.Genkit
	ModelStatus OllamaModelMeta
}

func (a Agent) Model() ai.Model {
	return a.model
}

func (a Agent) Genkit() *genkit.Genkit {
	return a.genkit
}

func (a *Agent) Models() (map[string]any, error) {
	url := fmt.Sprintf("%s/api/ps", a.Config.ServerAddress)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	var body map[string]any
	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		fmt.Println(err)
	}

	return body, nil
}

func Providers() {
	resources := genkit.ListResources(InitializedAgent.Genkit())
	for _, i := range resources {
		fmt.Printf("%+v\n", i)
	}
}

func Initalize(embed fs.FS) {
	InitializedAgent = &Agent{
		genkit: genkit.Init(
			context.TODO(),
			genkit.WithPlugins(getLlamaConfig(), getOllamaConfig()),
			genkit.WithPromptFS(embed),
		),
	}

	fmt.Println("Agent initialized")
}

func getEnvValue(key string) (string, error) {
	value, isSet := os.LookupEnv(key)
	if !isSet {
		return "", fmt.Errorf("(%s) is not found in environment", key)
	}

	return value, nil
}
