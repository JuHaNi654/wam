package llm

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"server/internal/logger"
	"sync"

	"github.com/firebase/genkit/go/core/api"
	"github.com/firebase/genkit/go/genkit"
)

var (
	instance *Agent
	once     sync.Once
)

type Agent struct {
	mu                 sync.RWMutex
	genkit             *genkit.Genkit
	selected           *Selected
	availableProviders map[string]api.Plugin

	incomingNotifications chan []byte
	notify                chan []byte
	ctx                   context.Context
	cancel                context.CancelFunc
}

type Selected struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

type ProviderInfo struct {
	Name      string `json:"name"`
	Addr      string `json:"addr"`
	Available bool   `json:"available"`
}

func Init(embed fs.FS) {
	once.Do(func() {
		ctx, cancel := context.WithCancel(context.Background())

		instance = &Agent{
			availableProviders: make(map[string]api.Plugin),
			ctx:                ctx,
			cancel:             cancel,
		}

		llama := getLlamaPlugin(ctx)
		instance.availableProviders[llama.Name()] = llama

		instance.genkit = genkit.Init(
			ctx,
			genkit.WithPlugins(llama),
			genkit.WithPromptFS(embed),
		)
	})
}

func (a *Agent) Close() {
	a.cancel()
}

func GetInstance() *Agent {
	return instance
}

func (a *Agent) Genkit() *genkit.Genkit {
	return a.genkit
}

func (a *Agent) Selected() string {
	a.mu.RLock()
	defer a.mu.RUnlock()
	if a.selected == nil {
		return ""
	}

	return fmt.Sprintf("%s/%s", a.selected.Provider, a.selected.Model)
}

func (a *Agent) ClearSelected() {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.selected = nil
}

func (a *Agent) Select(provider string, model string) error {
	models, err := a.ListModels(provider)
	if err != nil {
		return err
	}

	a.mu.Lock()
	defer a.mu.Unlock()

	for _, m := range models {
		if m.ID == model && m.Status == "unloaded" {
			return ErrModelNotLoaded
		} else if m.ID == model {
			a.selected = &Selected{Provider: provider, Model: model}
			return nil
		}
	}

	return ErrProviderNotAvailable
}

func (a *Agent) ProviderAvailability() (bool, error) {
	if a.selected == nil {
		return false, errors.New("provider is not currently selected")
	}

	provider, ok := a.availableProviders[a.selected.Provider]
	if !ok {
		return false, ErrProviderNotAvailable
	}

	switch p := provider.(type) {
	case *Llama:
		statusCode, err := get[any](fmt.Sprintf("%s/health", p.BaseURL), nil)
		return statusCode == http.StatusOK, err
	default:
		return false, nil // Should never happen, because we check if model is available
	}
}

func (a *Agent) LoadModel(provider string, model string) error {
	var err error
	selectedProvider, ok := a.availableProviders[provider]
	if !ok {
		return ErrProviderNotAvailable
	}

	switch p := selectedProvider.(type) {
	case *Llama:
		err = p.Load(model)
	}

	return err
}

func (a *Agent) UnloadModel(provider string, model string) error {
	var err error
	selectedProvider, ok := a.availableProviders[provider]
	if !ok {
		return ErrProviderNotAvailable
	}

	switch p := selectedProvider.(type) {
	case *Llama:
		err = p.Unload(model)
	}

	return err
}

func (a *Agent) GetSelectedProviderPlugin() api.Plugin {
	if a.selected == nil {
		return nil
	}
	return a.availableProviders[a.selected.Provider]
}

func (a *Agent) Providers() []ProviderInfo {
	providers := []ProviderInfo{}

	var (
		addr      string
		available bool
	)
	for _, provider := range a.availableProviders {
		switch s := provider.(type) {
		case *Llama:
			addr = s.BaseURL
			statusCode, err := get[any](fmt.Sprintf("%s/health", addr), nil)
			available = statusCode == 200
			if err != nil {
				logger.GetInstance().Error(fmt.Sprintf("could not check providers availability: %s\n", err.Error()))
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

func (a *Agent) ListModels(provider string) ([]Model, error) {
	var models []Model
	selectedProvider, ok := a.availableProviders[provider]
	if !ok {
		return nil, ErrProviderNotAvailable
	}

	switch p := selectedProvider.(type) {
	case *Llama:
		models = ListLlamaModels(fmt.Sprintf("%s/%s", p.BaseURL, "v1/models"))
	}

	return models, nil
}
