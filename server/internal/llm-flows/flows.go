package llmflows

import (
	"context"
	"fmt"
	llm "server/internal/llm"
	llmtools "server/internal/llm-tools"
	"server/internal/models"
	"sync"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

var (
	once          sync.Once
	HardskillFlow *core.Flow[HardSkillInput, []models.SkillSearch, struct{}]
)

type HardSkillInput struct {
	Text string `json:"text" jsonschema:"description=Text that might contain programming related hard skills to list"`
}

type HardSkillOutput struct {
	Skills []models.SkillSearch `json:"skills"`
}

func hardSkillFlow(manager *llm.LLMManager, tools []ai.ToolRef) *core.Flow[HardSkillInput, []models.SkillSearch, struct{}] {
	return genkit.DefineFlow(manager.Genkit, "hardskillFlow",
		func(ctx context.Context, input HardSkillInput) ([]models.SkillSearch, error) {
			model := manager.ActiveFull()
			if model == "" {
				return nil, fmt.Errorf("Model is not set in LLMManager")
			}

			prompt := genkit.LookupPrompt(manager.Genkit, "hard-skill")
			if prompt == nil {
				return nil, fmt.Errorf("hard-skill prompt not found")
			}

			resp, err := prompt.Execute(
				ctx,
				ai.WithInput(input),
				ai.WithModelName(model),
				ai.WithMaxTurns(50),
				ai.WithTools(tools...),
			)

			if err != nil {
				return nil, fmt.Errorf("error in hardskillFlow: %v", err)
			}

			result, _, err := genkit.GenerateData[HardSkillOutput](
				ctx, manager.Genkit,
				ai.WithPrompt("Return the result as JSON. Use the id from the lookup results, if id is empty set status NEW otherwise set status SAVED"),
				ai.WithModelName(model),
				ai.WithMaxTurns(50),
				ai.WithMessages(resp.History()...),
			)

			if err != nil {
				return nil, fmt.Errorf("error in hardskillFlow: %v", err)
			}

			return result.Skills, err
		})
}

func Mount(manager *llm.LLMManager) {
	once.Do(func() {
		HardskillFlow = hardSkillFlow(manager, []ai.ToolRef{llmtools.QuerySavedSkills})
	})
}

func MountTesting(manager *llm.LLMManager) {
	once.Do(func() {
		HardskillFlow = hardSkillFlow(manager, []ai.ToolRef{})
	})
}
