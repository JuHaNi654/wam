package models

type Action struct {
	Title         string `json:"title" validate:"required"`
	Note          string `json:"note"`
	ApplicationID string `json:"application_id" validate:"required" gorm:"column:application_id"`
	Date          int64  `json:"date" validate:"required"`
}

type SavedAction struct {
	ID string `gorm:"primaryKey" json:"id"`
	Action
}

func (SavedAction) TableName() string {
	return "actions"
}
