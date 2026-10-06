package llmflows

import (
	"context"
	"encoding/json"
	"server/internal/llm"
	"server/internal/llm/providers"
	"server/internal/models"
	"testing"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

// defineTestModel registers a model action that returns a fixed response.
func defineTestModel(g *genkit.Genkit, name string, response *ai.ModelResponse) {
	genkit.DefineModelAction(g, name, &ai.ModelOptions{
		Supports: &ai.ModelSupports{Multiturn: true, Tools: true, SystemRole: true},
	}, func(ctx context.Context, req *ai.ModelRequest, _ struct{}, cb ai.ModelStreamCallback) (*ai.ModelResponse, error) {
		return response, nil
	})
}

// defineErrorModel registers a model action that returns a designated error.
func defineErrorModel(g *genkit.Genkit, name string, err error) {
	genkit.DefineModelAction(g, name, &ai.ModelOptions{
		Supports: &ai.ModelSupports{Multiturn: true, Tools: true, SystemRole: true},
	}, func(ctx context.Context, req *ai.ModelRequest, _ struct{}, cb ai.ModelStreamCallback) (*ai.ModelResponse, error) {
		return nil, err
	})
}

func defineLLMManager(ctx context.Context, body []byte) *llm.LLMManager {
	manager := new(llm.LLMManager)
	manager.Genkit = genkit.Init(ctx)
	genkit.DefinePrompt(manager.Genkit, "hard-skill", ai.WithPrompt("{{ text }}"))

	manager.Providers = make(map[string]providers.Provider)
	manager.Providers["mock/provider"] = providers.InitMockProvider()

	_ = manager.SetActive("mock/provider", "mock/model")

	defineTestModel(manager.Genkit, manager.ActiveFull(), &ai.ModelResponse{
		FinishReason: ai.FinishReasonStop,
		Message:      ai.NewModelTextMessage(string(body)),
	})

	return manager
}

func TestHardSkillFlow(t *testing.T) {
	ctx := context.Background()

	want := HardSkillOutput{
		Skills: []models.SkillSearch{
			{Skill: models.Skill{ID: "0000-0000", Name: "JavaScript"}, Status: models.SavedSkillType},
			{Skill: models.Skill{ID: "0000-0000", Name: "HTML"}, Status: models.SavedSkillType},
			{Skill: models.Skill{ID: "0000-0000", Name: "CSS"}, Status: models.SavedSkillType},
			{Skill: models.Skill{ID: "", Name: "Tailwind"}, Status: models.NewSkillType},
		},
	}
	body, _ := json.Marshal(want)
	manager := defineLLMManager(ctx, body)
	MountTesting(manager)

	got, err := HardskillFlow.Run(ctx, HardSkillInput{
		Text: "This is sample placeholder text",
	})

	if err != nil {
		t.Fatalf("flow failed: %v", err)
	}

	if len(got) != 4 {
		t.Fatalf("got %+v, want %+v", got, want)
	}
}
