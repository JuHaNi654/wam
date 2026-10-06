package models

type SkillStatusType string

var (
	SavedSkillType SkillStatusType = "SAVED"
	NewSkillType   SkillStatusType = "NEW"
)

type Skill struct {
	ID   string `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
}

type SkillExtended struct {
	Skill
	InUse int `json:"in_use,omitempty"`
}

type SkillSearch struct {
	Skill
	Status SkillStatusType `gorm:"-:all" json:"status,omitempty"`
}

func (s *SkillSearch) Base() Skill {
	return s.Skill
}

func (Skill) TableName() string {
	return "skill"
}

type UpdateSkills struct {
	Skills []Skill `json:"skills"`
}
