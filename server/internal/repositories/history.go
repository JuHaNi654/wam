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
	return r.db.Create(models.SavedHistory{
		ID:        uuid.New().String(),
		ProfileID: profileKey,
		History:   *history,
	}).Error
}

func (r *HistoryRepository) ListByProfileID(profileID string) ([]models.SavedHistory, error) {
	var items []models.SavedHistory

	result := r.db.Where("profile_id = ?", profileID).Find(&items)
	return items, result.Error
}

func (r *HistoryRepository) Update(id string, data map[string]any) error {
	ctx := context.Background()

	_, err := gorm.G[map[string]any](r.db).Table("history").Where("id = ?", id).Updates(ctx, data)
	return err
}

func (r *HistoryRepository) Delete(id string) error {
	ctx := context.Background()
	_, err := gorm.G[models.SavedHistory](r.db).Where("id = ?", id).Delete(ctx)
	return err
}
