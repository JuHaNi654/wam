package repositories

import (
	"server/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const settingsKey = "settings"

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) Get() (*models.Settings, error) {
	item := new(models.Settings)
	result := r.db.First(&item, "id = ?", settingsKey)
	return item, result.Error
}

func (r *SettingsRepository) Save(data *models.Settings) error {
	data.ID = settingsKey
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"scrape_targets"}),
	}).Create(data).Error
}
