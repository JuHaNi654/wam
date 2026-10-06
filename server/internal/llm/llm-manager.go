package llm

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"server/internal/llm/providers"
	"sync"

	"github.com/firebase/genkit/go/genkit"
)

var (
	instance *LLMManager
	once     sync.Once
)

var (
	ErrModelNotLoaded       = errors.New("model is not loaded by given model id")
	ErrProviderNotAvailable = errors.New("provider is not available")
)

type LLMManager struct {
	Genkit    *genkit.Genkit
	Providers map[string]providers.Provider
	active    *Selected
}

type Selected struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

func Init(ctx context.Context, embed fs.FS) {
	once.Do(func() {
		instance = &LLMManager{
			Providers: make(map[string]providers.Provider),
		}

		llama := providers.InitLlama(ctx)
		instance.Providers[llama.Name()] = llama

		instance.Genkit = genkit.Init(ctx,
			genkit.WithPlugins(llama),
			genkit.WithPromptFS(embed))
	})
}

func GetInstance() *LLMManager {
	return instance
}

func (m *LLMManager) ListProviders() []providers.ProviderMeta {
	providers := []providers.ProviderMeta{}

	for _, provider := range m.Providers {
		providers = append(providers, provider.GetMetaInfo())
	}

	return providers
}

func (m *LLMManager) ListProviderModels(providerName string) ([]providers.ProviderModelMeta, error) {
	provider, ok := m.Providers[providerName]
	if !ok {
		return nil, ErrProviderNotAvailable
	}

	return provider.ListModels()
}

func (m *LLMManager) EnableModel(providerName string, model string) error {
	provider, ok := m.Providers[providerName]
	if !ok {
		return ErrProviderNotAvailable
	}

	return provider.EnableModel(model)
}

func (m *LLMManager) DisableModel(providerName string, model string) error {
	provider, ok := m.Providers[providerName]
	if !ok {
		return ErrProviderNotAvailable
	}

	return provider.DisableModel(model)
}

func (m *LLMManager) Active() string {
	if m.active != nil {
		return m.active.Model
	}

	return ""
}

func (m *LLMManager) ActiveFull() string {
	if m.active != nil {
		return fmt.Sprintf("%s/%s", m.active.Provider, m.active.Model)
	}

	return ""
}

func (m *LLMManager) SetActive(providerName string, model string) error {
	provider, ok := m.Providers[providerName]
	if !ok {
		return ErrProviderNotAvailable
	}

	isEnabled, err := provider.IsEnabled(model)
	if err != nil {
		return err
	}

	if isEnabled {
		m.active = &Selected{
			Provider: providerName,
			Model:    model,
		}
		return nil
	}

	return errors.New("given model name is not enabled")
}

func (m *LLMManager) ClearActive() {
	m.active = nil
}
