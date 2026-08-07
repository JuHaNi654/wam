package models

type History struct {
	Company     string `json:"company" validate:"required"`
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	StartDate   int64  `json:"start_date" gorm:"column:start_date"`
	EndDate     int64  `json:"end_date" gorm:"column:end_date"`
	Current     bool   `json:"current"`
}

type SavedHistory struct {
	ID        string `json:"id" gorm:"primaryKey"`
	ProfileID string `json:"-" gorm:"column:profile_id"`
	History
}

func (SavedHistory) TableName() string {
	return "history"
}
