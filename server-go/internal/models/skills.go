package models

type Skill struct {
	ID   string `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
}

func (Skill) TableName() string {
	return "skill"
}

type UpdateSkills struct {
	Skills []Skill `json:"skills"`
}
