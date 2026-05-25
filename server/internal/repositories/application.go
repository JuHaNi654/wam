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

func (r *ApplicationRepository) List() ([]models.Application, error) {
	items := []models.Application{}
	result := r.db.Model(&models.Application{}).
		Select([]string{"id", "name", "company", "status", "create_date"}).
		Find(&items)

	return items, result.Error
}

func (r *ApplicationRepository) Create(application *models.Application) error {
	application.ID = uuid.New().String()
	application.CreateDate = time.Now().Unix()
	return r.db.Create(application).Error
}

func (r *ApplicationRepository) GetByID(id string) (*models.Application, error) {
	var item models.Application
	result := r.db.First(&item, "id = ?", id)
	return &item, result.Error
}

func (r *ApplicationRepository) SetSkills(items []models.Skill, jobID string) ([]models.ApplicationSkill, error) {
	savedSkills := []models.ApplicationSkill{}
	ctx := context.Background()

	_, err := gorm.G[models.ApplicationSkill](r.db).Where("job_id = ?", jobID).Delete(ctx)
	if err != nil {
		return nil, err
	}

	for _, curr := range items {
		savedSkills = append(savedSkills, models.ApplicationSkill{
			ID:      uuid.New().String(),
			JobID:   jobID,
			SkillID: curr.ID,
		})
	}

	r.db.Create(savedSkills)
	return savedSkills, nil
}
