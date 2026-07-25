package database

import (
	"fmt"
	"os"
	"server/internal/logger"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB, sqlFile string) error {
	query, err := os.ReadFile(sqlFile)
	if err != nil {
		return err
	}
	result := db.Exec(string(query))
	if result.Error != nil {
		return result.Error
	}

	logger.Log.Info(fmt.Sprintf("Applied %s\n", sqlFile))
	return nil
}
