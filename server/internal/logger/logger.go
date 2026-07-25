// Package logger
package logger

import "log"

var Log ILogger

func InitLoger(current ILogger) {
	Log = current
}

type ILogger interface {
	Debug(content any)
	Info(msg string)
	Error(msg string)
	Warn(msg string)
}

type Echo struct{}

func (l Echo) Debug(content any) {
	log.Printf("Debug: %+v\n", content)
}

func (l Echo) Info(msg string) {
	log.Println("Info:", msg)
}

func (l Echo) Error(msg string) {
	log.Println("Error:", msg)
}

func (l Echo) Warn(msg string) {
	log.Println("Warn:", msg)
}

type NoLog struct{}

func (l NoLog) Debug(_ any) {}

func (l NoLog) Info(_ string) {}

func (l NoLog) Error(_ string) {}

func (l NoLog) Warn(_ string) {}
