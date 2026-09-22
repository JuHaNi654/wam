package cmd

import (
	"fmt"
	"path/filepath"
	"server/internal/database"
	"server/internal/utils"
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

	applicationPath, err := utils.GetApplicationPath()
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

// InitializeDatabase applies the production schema only when the database does
// not already exist. It is safe to run each time the container starts.
func InitializeDatabase() error {
	client := database.NewSQLiteClient()
	if client.FileIsExists() {
		fmt.Printf("Database already exists at %s\n", client.GetFilePath())
		return nil
	}

	if err := client.Connect(); err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	applicationPath, err := utils.GetApplicationPath()
	if err != nil {
		return err
	}

	schemaPath := filepath.Join(applicationPath, "sql", "init.sql")
	if err := database.Migrate(client.GetSession(), schemaPath); err != nil {
		return fmt.Errorf("apply initial schema: %w", err)
	}

	fmt.Printf("Initialized empty database at %s\n", client.GetFilePath())
	return nil
}
