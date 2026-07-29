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

func ListAdHardSkills(ctx *context.Context, a *llm.Agent, input ApplicationInput) (*Skills, error) {
	provider := a.GetSelectedProviderPlugin()
	if provider == nil {
		return nil, errors.New("provider is not set")
	}

	prompt := genkit.LookupDataPrompt[ApplicationInput, *Skills](a.Genkit(), "hard-skill")

	skills, _, err := prompt.Execute(
		(*ctx),
		input,
		ai.WithModelName(a.Selected()),
	)

	if err != nil {
		return nil, fmt.Errorf("could not generate skill list: %v", err)
	}

	return skills, nil
}
