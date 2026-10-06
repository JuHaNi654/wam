package providers

type Provider interface {
	// Return current provider name.
	Name() string
	// Return provider extended information.
	GetMetaInfo() ProviderMeta
	// Checks if given model name is enabled
	IsEnabled(modelName string) (bool, error)
	// List all available model on current provider.
	ListModels() ([]ProviderModelMeta, error)
	// Enable given model name in current provider.
	EnableModel(modelName string) error
	// Disable given model name in current provider.
	DisableModel(modelName string) error
}

type ProviderMeta struct {
	Name      string `json:"name"`
	Addr      string `json:"addr"`
	Available bool   `json:"available"`
}

type ProviderModelMeta struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}
