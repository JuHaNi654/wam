package utils

import (
	"os"
	"path/filepath"
)

func GetApplicationPath() (string, error) {
	if os.Getenv("MODE") == "production" {
		ex, err := os.Executable()
		if err != nil {
			return "", err
		}

		return filepath.Dir(ex), nil
	}

	return os.Getwd()
}
