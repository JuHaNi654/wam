package repositories

import (
	"context"
	"server/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ActionRepository struct {
	db *gorm.DB
}

func NewActionRepository(db *gorm.DB) *ActionRepository {
	return &ActionRepository{db: db}
}

func (r *ActionRepository) GetByJobID(jobID string) ([]models.Action, error) {
	var items []models.Action
	result := r.db.Where("job_id = ?", jobID).Find(&items)
	return items, result.Error
}

func (r *ActionRepository) Create(action *models.Action) error {
	action.ID = uuid.New().String()
	action.Date = time.Now().Unix()
	return r.db.Create(action).Error
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
