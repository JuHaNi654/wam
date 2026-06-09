package models

type Action struct {
	ID            string `gorm:"primaryKey" json:"id"`
	Title         string `json:"title"`
	Date          int64  `json:"date"`
	Note          string `json:"note"`
	ApplicationID string `json:"application_id" gorm:"column:application_id"`
}

func (Action) TableName() string {
	return "actions"
}
