package repositories

import (
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
