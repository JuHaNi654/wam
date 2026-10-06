package providers

import "github.com/firebase/genkit/go/plugins/compat_oai"

type MockProvider struct {
	compat_oai.OpenAICompatible
}

func InitMockProvider() *MockProvider {
	provider := new(MockProvider)

	provider.BaseURL = "localhost"
	provider.Provider = "mock/provider"
	return provider
}

func (m *MockProvider) Name() string {
	return m.Provider
}

func (m *MockProvider) GetMetaInfo() ProviderMeta {
	return ProviderMeta{
		Name:      m.Provider,
		Addr:      m.BaseURL,
		Available: true,
	}
}

func (m *MockProvider) ListModels() ([]ProviderModelMeta, error) {
	return nil, nil
}

func (m *MockProvider) EnableModel(modelName string) error {
	return nil
}

func (m *MockProvider) DisableModel(modelName string) error {
	return nil
}

func (m *MockProvider) IsEnabled(modelName string) (bool, error) {
	return true, nil
}
