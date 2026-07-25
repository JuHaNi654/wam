// Package skills
package skills

import (
	"context"
	"errors"
	"fmt"
	"server/internal/llm"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

type ApplicationInput struct {
	Ad string `json:"ad" jsonschema:"description=It related job opening ad"`
}

type Skills struct {
	Skills []string `json:"skills"`
}

func ListAdHardSkills(ctx *context.Context, a llm.AgentInstance, input ApplicationInput) (*Skills, error) {
	selectedProvider := a.Selected()
	if selectedProvider == nil {
		return nil, errors.New("provider is not set")
	}

	provider := llm.AvailableProviders[selectedProvider.Provider]
	prompt := genkit.LookupDataPrompt[ApplicationInput, *Skills](
		a.Genkit(), "hard-skill",
	)

	skills, _, err := prompt.Execute(
		(*ctx),
		input,
		ai.WithModel(provider),
	)

	if err != nil {
		return nil, fmt.Errorf("could not generate skill list: %v", err)
	}

	return skills, nil
}
