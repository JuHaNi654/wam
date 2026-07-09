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
	Selected() *Selected
}

type Selected struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

type Agent struct {
	genkit   *genkit.Genkit
	selected *Selected
}

func (a Agent) Genkit() *genkit.Genkit {
	return a.genkit
}

func (a Agent) Selected() *Selected {
	return a.selected
}

func (a *Agent) UseModel(provider string, model string) error {
	models, err := ListModels(provider)
	if err != nil {
		return err
	}

	for _, m := range models {
		if m.ID == model && m.Status == "unloaded" {
			return fmt.Errorf("model (%s) is not loaded", model)
		} else if m.ID == model {
			a.selected = &Selected{Provider: provider, Model: model}
			return nil
		}
	}

	return fmt.Errorf("provider (%s) does not have any models available", provider)
}

func (a *Agent) ClearSelected() {
	a.selected = nil
}

func (a *Agent) ProviderAvailability() (bool, error) {
	if a.selected == nil {
		return false, errors.New("provider is not currently selected")
	}

	provider, ok := AvailableProviders[a.selected.Provider]
	if !ok {
		return false, fmt.Errorf("provider (%s) is not available", provider)
	}

	switch p := provider.(type) {
	case *Llama:
		statusCode, err := get[any](fmt.Sprintf("%s/health", p.BaseURL), nil)
		return statusCode == 200, err
	default:
		return false, nil // Should never happen, because we check if model is available
	}
}

func (a *Agent) LoadModel(provider string, model string) error {
	var err error
	selectedProvider, ok := AvailableProviders[provider]
	if !ok {
		return fmt.Errorf("provider (%s) is not available", provider)
	}

	switch p := selectedProvider.(type) {
	case *Llama:
		err = p.Load(model)
	}

	return err
}

func (a *Agent) UnloadModel(provider string, model string) error {
	var err error
	selectedProvider, ok := AvailableProviders[provider]
	if !ok {
		return fmt.Errorf("provider (%s) is not available", provider)
	}

	switch p := selectedProvider.(type) {
	case *Llama:
		err = p.Unload(model)
	}

	return err
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

func ListModels(provider string) ([]Model, error) {
	var models []Model
	selectedProvider, ok := AvailableProviders[provider]
	if !ok {
		return nil, fmt.Errorf("provider (%s) is not available", provider)
	}

	switch p := selectedProvider.(type) {
	case *Llama:
		models = ListLlamaModels(fmt.Sprintf("%s/%s", p.BaseURL, "v1/models"))
	}

	return models, nil
}
