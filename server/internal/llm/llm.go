package llm

import (
	"context"
	"errors"
	"fmt"
	"io/fs"

	"github.com/firebase/genkit/go/core/api"
	"github.com/firebase/genkit/go/genkit"
)

var InitializedAgent *Agent
var AvailableProviders = make(map[string]api.Plugin)

type AgentInstance interface {
	Genkit() *genkit.Genkit
	Model() string
}

type Agent struct {
	genkit           *genkit.Genkit
	selectedProvider string
	selectedModel    string
}

func (a Agent) Genkit() *genkit.Genkit {
	return a.genkit
}

func (a *Agent) SetProvider(provider string) {
	a.selectedProvider = provider
}

func (a Agent) Provider() string {
	return a.selectedProvider
}

func (a *Agent) SetModel(model string) {
	a.selectedModel = model
}

func (a *Agent) Model() string {
	return a.selectedModel
}

func (a *Agent) LoadModel(providerName string, model string) error {
	provider, ok := AvailableProviders[providerName]
	if !ok {
		return errors.New("provider by given name is not available")
	}

	switch p := provider.(type) {
	case *Llama:
		return p.Load(model)
	default:
	}

	return nil
}

func (a *Agent) UnloadModel(providerName string, model string) error {
	provider, ok := AvailableProviders[providerName]
	if !ok {
		return errors.New("provider by given name is not available")
	}

	switch p := provider.(type) {
	case *Llama:
		return p.Unload(model)
	default:
	}

	return nil
}

func Initalize(embed fs.FS) {
	llama := getLlamaPlugin()

	AvailableProviders[llama.Name()] = llama

	InitializedAgent = &Agent{
		genkit: genkit.Init(
			context.TODO(),
			genkit.WithPlugins(llama),
			genkit.WithPromptFS(embed),
		),
	}
}

type ProviderInfo struct {
	Name      string `json:"name"`
	Addr      string `json:"addr"`
	Available bool   `json:"available"`
}

func Providers() []ProviderInfo {
	providers := []ProviderInfo{}

	var (
		addr      string
		available bool
	)
	for _, provider := range AvailableProviders {
		switch s := provider.(type) {
		case *Llama:
			addr = s.BaseURL
			statusCode, err := get[any](fmt.Sprintf("%s/health", addr), nil)
			available = statusCode == 200
			if err != nil {
				fmt.Printf("could not check providers availability: %s\n", err.Error())
			}
		}

		providers = append(providers, ProviderInfo{
			Name:      provider.Name(),
			Addr:      addr,
			Available: available,
		})
	}

	return providers
}

func ProviderModels(providerName string) []Model {
	provider, ok := AvailableProviders[providerName]
	if !ok {
		fmt.Printf("provider is not available (%s)\n", providerName)
		return nil
	}

	switch p := provider.(type) {
	case *Llama:
		return ListLlamaModels(fmt.Sprintf("%s/%s", p.BaseURL, "v1/models"))
	default:
	}

	return nil
}
