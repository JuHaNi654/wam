package repositories

import (
	"context"
	"server/internal/models"

	"gorm.io/gorm"
)

const profileKey = "profile"

type ProfileRepository struct {
	db *gorm.DB
}

func NewProfileRepository(db *gorm.DB) *ProfileRepository {
	return &ProfileRepository{db: db}
}

func (r *ProfileRepository) Get() (*models.Profile, error) {
	item := new(models.Profile)
	result := r.db.First(&item, "id = ?", profileKey)
	return item, result.Error
}

// TODO: Check if profile already exists
func (r *ProfileRepository) Create() (*models.Profile, error) {
	profile := new(models.Profile)
	profile.ID = profileKey

	err := r.db.Create(profile).Error
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (r *ProfileRepository) Skills() ([]models.Skill, error) {
	var items []models.Skill

	result := r.db.Table("profile_skill").
		Select("skill.id, skill.name").
		Joins("left join skill on skill.id = profile_skill.skill_id").
		Where("profile_skill.profile_id", profileKey).
		Scan(&items)

	return items, result.Error
}

func (r *ProfileRepository) SetSkills(items []models.Skill) error {
	savedSkills := []models.ProfileSkill{}
	ctx := context.Background()

	_, err := gorm.G[models.ProfileSkill](r.db).Where("profile_id = ?", profileKey).Delete(ctx)
	if err != nil {
		return err
	}

	for _, curr := range items {
		savedSkills = append(savedSkills, models.ProfileSkill{
			ProfileID: profileKey,
			SkillID:   curr.ID,
		})
	}

	r.db.Create(savedSkills)
	return nil
}
