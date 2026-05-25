package models

var ApplicationStatus = []string{
	"saved",
	"applied",
	"interviewing",
	"offered",
	"rejected",
	"withdrawn",
}

type Application struct {
	ID          string `gorm:"primaryKey" json:"id"`
	Name        string `json:"name"`
	Company     string `json:"company"`
	Title       string `json:"job_title" gorm:"column:job_title"`
	Homepage    string `json:"homepage"`
	Link        string `json:"link"`
	Status      string `json:"status"`
	CreateDate  int64  `gorm:"column:create_date" json:"create_date"`
	Ad          string `json:"job_ad" gorm:"column:job_ad"`
	Application string `json:"job_application" gorm:"column:job_application"`
}

func (Application) TableName() string {
	return "job"
}

type ApplicationSkill struct {
	ID      string `gorm:"primaryKey" json:"id"`
	JobID   string `gorm:"column:job_id" json:"job_id"`
	SkillID string `gorm:"column:skill_id" json:"skill_id"`
}

func (ApplicationSkill) TableName() string {
	return "application_skill"
}

type NewAppliCationSkills struct {
	Skills []Skill `json:"skills"`
}
