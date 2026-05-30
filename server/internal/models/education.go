package models

type Education struct {
	ID        string `gorm:"primaryKey" json:"id"`
	Program   string `json:"program"`
	School    string `json:"school"`
	StartDate int64  `gorm:"column:start_date" json:"start_date"`
	EndDate   int64  `gorm:"column:end_date" json:"end_date"`

	ProfileID string `gorm:"column:profile_id" json:"profile_id"`
}

func (Education) TableName() string {
	return "education"
}
