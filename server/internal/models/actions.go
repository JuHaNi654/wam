package models

type Action struct {
	ID    string `gorm:"primaryKey" json:"id"`
	Title string `json:"title"`
	Date  int64  `json:"date"`
	Note  string `json:"note"`
	JobID string `json:"job_id" gorm:"column:job_id"`
}
