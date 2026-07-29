package database

import (
	"errors"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var databasePath = ".local/share/wam"
var databaseName = "sqlite.db"

type SQLiteClient struct {
	Filename     string
	DatabasePath string

	session *gorm.DB
}

func (client SQLiteClient) GetSession() *gorm.DB {
	return client.session
}

func (client SQLiteClient) GetFilePath() string {
	return filepath.Join(client.DatabasePath, client.Filename)
}

func (client SQLiteClient) FileIsExists() bool {
	_, err := os.Stat(client.GetFilePath())
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return false
	}

	return !errors.Is(err, os.ErrNotExist)
}

func (client *SQLiteClient) Connect() error {

	_, err := os.Stat(client.DatabasePath)
	if errors.Is(err, os.ErrNotExist) {
		if err := os.Mkdir(client.DatabasePath, os.ModePerm); err != nil {
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

func NewSQLiteClient() *SQLiteClient {
	homeDir, _ := os.UserHomeDir()

	client := &SQLiteClient{
		Filename:     databaseName,
		DatabasePath: filepath.Join(homeDir, databasePath),
	}

	return client
}
