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
	NotificationLLMStatusChange NotificationType = "llm-status-change"
)

var Current NotificationService

type Payload struct {
	Type    NotificationType `json:"type"`
	Content any              `json:"content"`
}

type Client struct {
	ID   string
	Send chan []byte
	Done chan struct{}
}

type NotificationService struct {
	clients map[*Client]bool
	mu      sync.Mutex
}

func Init() {
	Current = NotificationService{
		clients: make(map[*Client]bool),
	}
}

func (s *NotificationService) Register(c *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.clients[c] = true
}

func (s *NotificationService) UnRegister(c *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.clients[c] {
		close(c.Done)
		delete(s.clients, c)
	}
}

func (s *NotificationService) Send(payload Payload) {
	s.mu.Lock()
	defer s.mu.Unlock()

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(payload)

	for c := range s.clients {
		select {
		case c.Send <- buf.Bytes():
		default:
			fmt.Printf("dropping message\n")
		}
	}
}
