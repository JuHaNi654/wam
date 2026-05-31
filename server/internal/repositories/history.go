package repositories

import (
	"context"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HistoryRepository struct {
	db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) *HistoryRepository {
	return &HistoryRepository{db: db}
}

func (r *HistoryRepository) Create(history *models.History) error {
	history.ID = uuid.New().String()
	history.ProfileID = profileKey
	return r.db.Create(history).Error
}

func (r *HistoryRepository) ListByProfileID(profileID string) ([]models.History, error) {
	var items []models.History

	result := r.db.Where("profile_id = ?", profileID).Find(&items)
	return items, result.Error
}

func (r *HistoryRepository) Update(id string, data map[string]any) error {
	ctx := context.Background()

	_, err := gorm.G[map[string]any](r.db).Table("history").Where("id = ?", id).Updates(ctx, data)
	return err
}
