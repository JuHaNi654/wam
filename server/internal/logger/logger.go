// Package logger
package logger

import "log"

type ILogger interface {
	Debug(content any)
	Info(msg string)
	Error(msg string)
	Warn(msg string)
}

type EchoLogger struct{}

func (l EchoLogger) Debug(content any) {
	log.Printf("Debug: %+v\n", content)
}

func (l EchoLogger) Info(msg string) {
	log.Println("Info:", msg)
}

func (l EchoLogger) Error(msg string) {
	log.Println("Error:", msg)
}

func (l EchoLogger) Warn(msg string) {
	log.Println("Warn:", msg)
}
