package services

import (
	"errors"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var databasePath = ".local/share/wam"
var databaseName = "sqlite.db"

func IntiSqlite() (*gorm.DB, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	path := filepath.Join(homeDir, databasePath)
	_, err = os.Stat(path)

	if errors.Is(err, os.ErrNotExist) {
		err = os.Mkdir(path, os.ModePerm)
		if err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	return gorm.Open(sqlite.Open(filepath.Join(path, databaseName)), &gorm.Config{})
}
