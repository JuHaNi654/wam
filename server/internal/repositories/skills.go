package repositories

import (
	"errors"
	"server/internal/models"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrSkillAlreadyExists = errors.New("skill already exists")
	ErrSkillNameRequired  = errors.New("skill name is required")
)

type SkillRepository struct {
	db *gorm.DB
}

func NewSkillRepository(db *gorm.DB) *SkillRepository {
	return &SkillRepository{db: db}
}

func (r *SkillRepository) GetByJobID(jobID string) ([]models.Skill, error) {
	var items []models.Skill

	result := r.db.Table("application_skill").
		Select("skill.id, skill.name").
		Joins("left join skill on skill.id = application_skill.skill_id").
		Where("application_skill.application_id", jobID).
		Scan(&items)

	return items, result.Error
}

func (r *SkillRepository) List() ([]models.Skill, error) {
	items := []models.Skill{}
	result := r.db.Model(&models.Skill{}).Find(&items)

	return items, result.Error
}

func (r *SkillRepository) Create(skill *models.Skill) error {
	skill.Name = strings.TrimSpace(skill.Name)
	if skill.Name == "" {
		return ErrSkillNameRequired
	}

	skill.ID = uuid.New().String()
	result := r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(skill)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrSkillAlreadyExists
	}

	return nil
}
