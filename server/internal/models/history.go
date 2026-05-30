package models

type History struct {
	ID          string `gorm:"primaryKey" json:"id"`
	Company     string `json:"company"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartDate   int64  `gorm:"column:start_date" json:"start_date"`
	EndDate     int64  `gorm:"column:end_date" json:"end_date"`
	Current     bool   `json:"current"`

	ProfileID string `gorm:"column:profile_id" json:"profile_id"`
}

func (History) TableName() string {
	return "history"
}
