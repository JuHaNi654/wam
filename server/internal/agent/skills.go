package agent

import (
	"context"
	"errors"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

func ListAdHardSkills(ctx *context.Context, a Agent, input ApplicationInput) (*Skills, error) {
	prompt := genkit.LookupDataPrompt[ApplicationInput, *Skills](
		a.Genkit(), "hard-skill",
	)

	skills, _, err := prompt.Execute(
		(*ctx),
		input,
		ai.WithModel(a.Model()),
	)

	if err != nil {
		msg := fmt.Sprintf("could not generate skill list: %v", err)
		return nil, errors.New(msg)
	}

	return skills, nil
}
