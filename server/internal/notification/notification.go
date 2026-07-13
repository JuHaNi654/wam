// Package sse code
package notification

import "sync"

type NotificationType string

const (
	NotificationLLM NotificationType = "llm"
)

type Payload struct {
	Type    NotificationType `json:"type"`
	Content map[string]any   `json:"content"`
}

type NotificationService struct {
	ConnectClient chan chan []byte
	CloseClient   chan chan []byte
	clients       map[chan []byte]struct{} // Map to keep track of connected clients
	sync          sync.Mutex

	srvWg sync.WaitGroup
	reqWg sync.WaitGroup
}
