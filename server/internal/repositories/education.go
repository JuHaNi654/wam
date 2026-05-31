package repositories

import (
	"context"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EducationRepository struct {
	db *gorm.DB
}

func NewEducationRepository(db *gorm.DB) *EducationRepository {
	return &EducationRepository{
		db: db,
	}
}

func (r *EducationRepository) Create(education *models.Education) error {
	education.ID = uuid.New().String()
	education.ProfileID = profileKey
	return r.db.Create(education).Error
}

func (r *EducationRepository) ListByProfileID(profileID string) ([]models.Education, error) {
	var items []models.Education

	result := r.db.Where("profile_id = ?", profileID).Find(&items)
	return items, result.Error
}

func (r *EducationRepository) Delete(id string) error {
	ctx := context.Background()
	_, err := gorm.G[models.Education](r.db).Where("id = ?", id).Delete(ctx)
	return err
}
