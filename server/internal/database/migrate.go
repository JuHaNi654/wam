package database

import (
	"fmt"
	"os"

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

	fmt.Printf("Applied %s\n", sqlFile)
	return nil
}
