package services

import (
	"server/internal/repositories"

	"gorm.io/gorm"
)

type Service struct {
	ApplicationRepository *repositories.ApplicationRepository
	ActionRepository      *repositories.ActionRepository
	SkillRepository       *repositories.SkillRepository
	ProfileRepository     *repositories.ProfileRepository
	HistoryRepository     *repositories.HistoryRepository
	EducationRepository   *repositories.EducationRepository
}

func NewService(db *gorm.DB) *Service {
	return &Service{
		ApplicationRepository: repositories.NewApplicationRepository(db),
		ActionRepository:      repositories.NewActionRepository(db),
		SkillRepository:       repositories.NewSkillRepository(db),
		ProfileRepository:     repositories.NewProfileRepository(db),
		HistoryRepository:     repositories.NewHistoryRepository(db),
		EducationRepository:   repositories.NewEducationRepository(db),
	}
}
