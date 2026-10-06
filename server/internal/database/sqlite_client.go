package database

import (
	"errors"
	"os"
	"path/filepath"
	"sync"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	instance *SQLiteClient
	once     sync.Once
)

func GetInstance() *SQLiteClient {
	return instance
}

type SQLiteClient struct {
	Filename     string
	DatabasePath string

	session *gorm.DB
}

func (client *SQLiteClient) GetSession() *gorm.DB {
	return client.session
}

func (client *SQLiteClient) GetFilePath() string {
	return filepath.Join(client.DatabasePath, client.Filename)
}

func (client *SQLiteClient) FileIsExists() bool {
	_, err := os.Stat(client.GetFilePath())
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return false
	}

	return !errors.Is(err, os.ErrNotExist)
}

func (client *SQLiteClient) Connect() error {

	_, err := os.Stat(client.DatabasePath)
	if errors.Is(err, os.ErrNotExist) {
		if err := os.MkdirAll(client.DatabasePath, 0o755); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}

	db, err := gorm.Open(sqlite.Open(client.GetFilePath()), &gorm.Config{})
	if err != nil {
		return err
	}

	client.session = db
	return nil
}

func InitSQLLite() {
	once.Do(func() {
		homeDir, _ := os.UserHomeDir()
		databasePath := os.Getenv("SQLITE_PATH")
		if databasePath == "" {
			databasePath = filepath.Join(homeDir, ".local/share/wam")
		} else if !filepath.IsAbs(databasePath) {
			databasePath = filepath.Join(homeDir, databasePath)
		}

		databaseName := os.Getenv("SQLITE_NAME")
		if databaseName == "" {
			databaseName = "sqlite.db"
		}

		instance = &SQLiteClient{
			Filename:     databaseName,
			DatabasePath: databasePath,
		}

	})
}
