package repositories

import (
	"context"
	"server/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApplicationRepository struct {
	db *gorm.DB
}

func NewApplicationRepository(db *gorm.DB) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

func (r *ApplicationRepository) List() (*[]models.SavedApplication, error) {
	items := new([]models.SavedApplication)
	result := r.db.Model(&models.SavedApplication{}).
		Select([]string{"id", "name", "company", "status", "create_date"}).
		Find(items)

	return items, result.Error
}

func (r *ApplicationRepository) Create(application models.Application) (*models.SavedApplication, error) {
	newApplication := &models.SavedApplication{
		ID:          uuid.New().String(),
		CreateDate:  time.Now().Unix(),
		Application: application,
	}
	err := r.db.Create(newApplication).Error
	return newApplication, err
}

func (r *ApplicationRepository) GetByID(applicationID string) (*models.SavedApplication, error) {
	item := new(models.SavedApplication)
	result := r.db.First(item, "id = ?", applicationID)
	return item, result.Error
}

func (r *ApplicationRepository) SetSkills(skills []models.Skill, applicationID string) ([]models.Skill, error) {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		ctx := context.Background()
		_, err := gorm.G[models.ApplicationSkill](tx).Where("application_id = ?", applicationID).Delete(ctx)
		if err != nil {
			return err
		}

		savedSkills := make([]models.ApplicationSkill, 0, len(skills))
		for _, skill := range skills {
			savedSkills = append(savedSkills, models.ApplicationSkill{
				ID:            uuid.New().String(),
				ApplicationID: applicationID,
				SkillID:       skill.ID,
			})
		}

		if len(savedSkills) == 0 {
			return nil
		}

		if result := tx.Create(&savedSkills); result.Error != nil {
			return result.Error
		}

		return nil
	})

	if err != nil {
		return nil, err
	}
	return skills, nil
}

func (r *ApplicationRepository) Update(id string, data map[string]any) error {
	ctx := context.Background()

	_, err := gorm.G[map[string]any](r.db).Table("application").Where("id = ?", id).Updates(ctx, data)
	return err
}

func (r *ApplicationRepository) Delete(id string) error {
	ctx := context.Background()
	// Relying on cascade delete, might need to wrap in to the transaction
	// function
	_, err := gorm.G[models.SavedApplication](r.db).Where("id = ?", id).Delete(ctx)
	return err
}
