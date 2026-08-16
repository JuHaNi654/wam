package models

type Application struct {
	Name        string            `json:"name,omitempty" validate:"required"`
	Company     string            `json:"company,omitempty" validate:"required"`
	Position    string            `json:"position,omitempty" validate:"required"`
	Homepage    *string           `json:"homepage,omitempty" validate:"omitempty,https_url,url"`
	Link        *string           `json:"link,omitempty" validate:"omitempty,https_url,url"`
	Status      ApplicationStatus `json:"status,omitempty" validate:"required,validate_status"`
	Ad          string            `json:"ad,omitempty"`
	Application string            `json:"application,omitempty"`
}

type SavedApplication struct {
	ID         string `json:"id,omitempty" gorm:"primaryKey"`
	CreateDate int64  `json:"create_date,omitempty" gorm:"column:create_date"`
	Application
}

func (SavedApplication) TableName() string {
	return "application"
}

type ApplicationSkill struct {
	ID            string `gorm:"primaryKey" json:"id"`
	ApplicationID string `gorm:"column:application_id" json:"application_id"`
	SkillID       string `gorm:"column:skill_id" json:"skill_id"`
}

func (ApplicationSkill) TableName() string {
	return "application_skill"
}
