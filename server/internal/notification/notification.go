// Package sse code
package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sync"
)

type NotificationType string

const (
	NotificationLLM NotificationType = "llm"
)

type Payload struct {
	Type    NotificationType `json:"type"`
	Content map[string]any   `json:"content"`
}

type Client struct {
	ID   string
	Send chan []byte
	Done chan struct{}
}

type NotificationService struct {
	Clients map[*Client]bool
	mu      sync.Mutex
}

func NewService() *NotificationService {
	return &NotificationService{
		Clients: make(map[*Client]bool),
	}
}

func (s *NotificationService) Register(c *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Clients[c] = true
}

func (s *NotificationService) UnRegister(c *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.Clients[c] {
		close(c.Done)
		delete(s.Clients, c)
	}
}

func (s *NotificationService) Send(payload Payload) {
	s.mu.Lock()
	defer s.mu.Unlock()

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(payload)

	for c := range s.Clients {
		select {
		case c.Send <- buf.Bytes():
		default:
			fmt.Printf("dropping message\n")
		}
	}
}
