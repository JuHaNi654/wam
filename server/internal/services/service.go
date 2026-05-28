package services

import (
	"server/internal/agent"
	"server/internal/repositories"

	"gorm.io/gorm"
)

type Service struct {
	ApplicationRepository *repositories.ApplicationRepository
	ActionRepository      *repositories.ActionRepository
	SkillRepository       *repositories.SkillRepository
	ProfileRepository     *repositories.ProfileRepository
	Agent                 *agent.Agent
}

func NewService(db *gorm.DB, agent *agent.Agent) *Service {
	return &Service{
		ApplicationRepository: repositories.NewApplicationRepository(db),
		ActionRepository:      repositories.NewActionRepository(db),
		SkillRepository:       repositories.NewSkillRepository(db),
		ProfileRepository:     repositories.NewProfileRepository(db),
		Agent:                 agent,
	}
}
