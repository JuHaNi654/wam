package agent

import (
	"errors"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

func ListAdHardSkills(a *Agent, input ApplicationInput) (*Skills, error) {
	prompt := genkit.LookupDataPrompt[ApplicationInput, *Skills](
		a.GenKit, "hard-skill",
	)

	skills, _, err := prompt.Execute(
		a.Ctx,
		input,
		ai.WithModel(a.Model),
	)

	if err != nil {
		msg := fmt.Sprintf("could not generate skill list: %v", err)
		return nil, errors.New(msg)
	}

	return skills, nil
}
