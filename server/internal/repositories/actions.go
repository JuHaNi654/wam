package repositories

import (
	"context"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ActionRepository struct {
	db *gorm.DB
}

func NewActionRepository(db *gorm.DB) *ActionRepository {
	return &ActionRepository{db: db}
}

func (r *ActionRepository) GetByApplicationID(applicationID string) ([]models.SavedAction, error) {
	var items []models.SavedAction
	result := r.db.Where("application_id = ?", applicationID).Find(&items)
	return items, result.Error
}

func (r *ActionRepository) GetByID(actionID string) (*models.SavedAction, error) {
	item := new(models.SavedAction)
	result := r.db.First(item, "id = ?", actionID)
	return item, result.Error
}

func (r *ActionRepository) Create(action *models.Action) (models.SavedAction, error) {
	savedAction := models.SavedAction{
		ID:     uuid.New().String(),
		Action: *action,
	}
	return savedAction, r.db.Create(savedAction).Error
}

func (r *ActionRepository) Update(id string, action map[string]any) error {
	ctx := context.Background()

	_, err := gorm.G[map[string]any](r.db).Table("actions").Where("id = ?", id).Updates(ctx, action)
	return err
}

func (r *ActionRepository) Delete(id string) error {
	ctx := context.Background()
	_, err := gorm.G[models.Action](r.db).Where("id = ?", id).Delete(ctx)
	return err
}
