package logger

import "log"

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
