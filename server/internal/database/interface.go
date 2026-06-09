// Package database manages database connections of the service
package database

import "gorm.io/gorm"

type DatabaseClient interface {
	GetSession() *gorm.DB
}
