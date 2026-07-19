package services

import (
	"server/internal/logger"
	"server/internal/notification"
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
	NotificationService   *notification.NotificationService
	Logger                logger.ILogger
}

func NewService(db *gorm.DB, logger logger.ILogger) *Service {
	return &Service{
		ApplicationRepository: repositories.NewApplicationRepository(db),
		ActionRepository:      repositories.NewActionRepository(db),
		SkillRepository:       repositories.NewSkillRepository(db),
		ProfileRepository:     repositories.NewProfileRepository(db),
		HistoryRepository:     repositories.NewHistoryRepository(db),
		EducationRepository:   repositories.NewEducationRepository(db),
		NotificationService:   notification.NewService(),
		Logger:                logger,
	}
}
