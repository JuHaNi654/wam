package utils

import (
	"os"
	"path/filepath"
	"strconv"
)

func ParsePagination(value string) (n int, ok bool) {
	if value == "" {
		return 0, false
	}
	n, err := strconv.Atoi(value)
	if err != nil || n < 1 {
		return 0, false
	}

	return n, true
}

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
