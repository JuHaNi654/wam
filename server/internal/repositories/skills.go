package repositories

import (
	"context"
	"errors"
	"server/internal/models"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrSkillAlreadyExists           = errors.New("skill already exists")
	ErrSkillNameRequired            = errors.New("skill name is required")
	ErrSkillHasApplicationRelations = errors.New("skill is used in applications")
	ErrSkillHasProfileRelations     = errors.New("skill is used in profile")
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

func (r *SkillRepository) GetTotalSkills() (count int64) {
	r.db.Model(&models.SkillExtended{}).Count(&count)
	return count
}

func (r *SkillRepository) List() ([]models.Skill, error) {
	items := []models.Skill{}
	result := r.db.Model(&models.Skill{}).Find(&items)

	return items, result.Error
}

func (r *SkillRepository) ListExtended(page int, perPage int) ([]models.SkillExtended, error) {
	offset := (page - 1) * perPage

	const query = `
		SELECT
			s.id,
			s.name,
			COALESCE(a.cnt, 0) + COALESCE(p.cnt, 0) AS in_use
		FROM skill s
		LEFT JOIN (
			SELECT skill_id, COUNT(*) AS cnt
			FROM application_skill
			GROUP BY skill_id
		) a ON a.skill_id = s.id
		LEFT JOIN (
			SELECT skill_id, COUNT(*) AS cnt
			FROM profile_skill
			GROUP BY skill_id
		) p ON p.skill_id = s.id
		ORDER BY in_use DESC, s.name, s.id
		LIMIT ? OFFSET ?`

	return gorm.G[models.SkillExtended](r.db).
		Raw(query, perPage, offset).
		Find(context.Background())
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

func (r *SkillRepository) Delete(id string, ctx *context.Context) error {
	return r.db.Transaction(func(tx *gorm.DB) (err error) {
		var count int64
		err = tx.Table("application_skill").Where("skill_id = ?", id).Count(&count).Error
		if err != nil {
			return err
		}

		if count > 0 {
			*ctx = context.WithValue(*ctx, "message", ErrSkillHasApplicationRelations.Error())
			return ErrSkillHasApplicationRelations
		}

		err = tx.Table("profile_skill").Where("skill_id = ?", id).Count(&count).Error
		if err != nil {
			return err
		}

		if count > 0 {
			*ctx = context.WithValue(*ctx, "message", ErrSkillHasProfileRelations.Error())
			return ErrSkillHasProfileRelations
		}

		res := tx.Where("id = ?", id).Delete(&models.Skill{})
		if res.Error != nil {
			return res.Error
		}

		if res.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}

		return nil
	})
}
