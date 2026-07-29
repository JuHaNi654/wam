package llm

import "errors"

var (
	ErrModelNotLoaded       = errors.New("model is not loaded by given model id")
	ErrProviderNotAvailable = errors.New("provider is not available")
)
