package models

type Education struct {
	Program   string `json:"program" validate:"required"`
	School    string `json:"school" validate:"required"`
	StartDate int64  `json:"start_date" validate:"required" gorm:"column:start_date"`
	EndDate   int64  `json:"end_date" validate:"required" gorm:"column:end_date"`
}

type SavedEducation struct {
	ID        string `json:"id" gorm:"primaryKey"`
	ProfileID string `json:"-" gorm:"column:profile_id"`
	Education
}

func (SavedEducation) TableName() string {
	return "education"
}
