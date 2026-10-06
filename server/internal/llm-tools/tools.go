package llmtools

import (
	"fmt"
	llm "server/internal/llm"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"
	"sync"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

var (
	once             sync.Once
	QuerySavedSkills *ai.ToolAction[SavedSkillsInput, []models.SkillSearch]
)

type SavedSkillsInput struct {
	Name string `json:"name" jsonschema:"description=The skill name or part of a name to search for. Pass only the name itself as the user wrote it without extra words like skill or saved."`
}

func querySavedSkills(g *genkit.Genkit, skillRepository *repositories.SkillRepository) *ai.ToolAction[SavedSkillsInput, []models.SkillSearch] {
	return genkit.DefineTool(g, "searchSavedSkills",
		"Searches the skills the user has already saved in the database and returns those whose name matches the given text. "+
			"Use this tool whenever you need to know if a skill already exists, to look up a saved skill's details before answering questions about it, "+
			"or to check for duplicates before creating a new skill. Matching is done on the skill name only. "+
			"Returns an empty list when no saved skill matches. In that case tell the user nothing was found instead of guessing or inventing skills.",
		func(toolCtx *ai.ToolContext, input SavedSkillsInput) ([]models.SkillSearch, error) {
			logger.GetInstance().Debug(fmt.Sprintf("Toolcall input: %+v", input))
			return skillRepository.SearchByName(input.Name)
		})
}

func Mount(manager *llm.LLMManager, s *services.Service) {
	once.Do(func() {
		QuerySavedSkills = querySavedSkills(manager.Genkit, s.SkillRepository)
	})
}
