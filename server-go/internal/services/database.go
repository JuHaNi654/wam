package services

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func IntiSqlite() (*gorm.DB, error) {
	return gorm.Open(sqlite.Open("../database/wam.db"), &gorm.Config{})
}