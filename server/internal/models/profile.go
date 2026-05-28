package models

type Profile struct {
	ID           string `gorm:"primaryKey" json:"id"`
	Introduction string `json:"introduction"`
}

func (Profile) TableName() string {
	return "profile"
}

type ProfileSkill struct {
	ProfileID string `gorm:"column:profile_id" json:"profile_id"`
	SkillID   string `gorm:"column:skill_id" json:"skill_id"`
}

func (ProfileSkill) TableName() string {
	return "profile_skill"
}
