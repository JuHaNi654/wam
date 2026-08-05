package models

type Settings struct {
	ID      string   `gorm:"primaryKey" json:"id"`
	Targets []Target `json:"targets" gorm:"serializer:json;column:scrape_targets"`
}

type Target struct {
	URL         string `json:"url"`
	TargetClass string `json:"class"`
}

func (Settings) TableName() string {
	return "settings"
}
