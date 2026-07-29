// Package logger
package logger

import (
	"sync"
)

var (
	instance Logger
	once     sync.Once
)

type Logger interface {
	Debug(content any)
	Info(msg string)
	Error(msg string)
	Warn(msg string)
}

func Init(current Logger) {
	once.Do(func() {
		instance = current
	})
}

func GetInstance() Logger {
	return instance
}
