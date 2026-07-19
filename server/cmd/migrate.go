package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"server/internal/database"
)

var sqlFiles = []string{
	"./sql/init.sql",
	"./sql/example.sql",
}

func Migrate() error {
	client := database.NewSQLiteClient()

	if client.FileIsExists() {
		return fmt.Errorf("override migration is currently disabled on existing sqlite file (path: %s)", client.GetFilePath())
	}

	if err := client.Connect(); err != nil {
		return fmt.Errorf("failed to initialize database\n %w", err)
	}

	applicationPath, err := getApplicationRootPath()
	if err != nil {
		return err
	}

	for _, sql := range sqlFiles {
		fmt.Println("Applying:", filepath.Join(applicationPath, sql))
		err := database.Migrate(client.GetSession(), filepath.Join(applicationPath, sql))
		if err != nil {
			return err
		}
	}

	return nil
}

func getApplicationRootPath() (string, error) {
	if false { // TODO: fix this
		ex, err := os.Executable()
		if err != nil {
			return "", err
		}

		return filepath.Dir(ex), nil
	}

	return os.Getwd()
}
