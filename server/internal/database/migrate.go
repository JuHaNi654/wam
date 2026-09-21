package database

import (
	"os"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB, sqlFile string) error {
	query, err := os.ReadFile(sqlFile)
	if err != nil {
		return err
	}
	return ApplySQL(db, string(query))
}

func ApplySQL(db *gorm.DB, query string) error {
	result := db.Exec(query)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
