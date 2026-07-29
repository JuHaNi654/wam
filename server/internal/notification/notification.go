// Package sse code
package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sync"
)

var (
	instance *NotificationService
	once     sync.Once
)

type NotificationType string

const (
	NotificationLLMStatusChange NotificationType = "llm-status-change"
	NotificationLLMModelEnabled NotificationType = "llm-model-enabled"
)

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
	once.Do(func() {
		instance = &NotificationService{
			clients: make(map[*Client]bool),
		}
	})
}

func GetInstance() *NotificationService {
	return instance
}

func (s *NotificationService) Close() {
	s.mu.Lock()
	defer s.mu.Unlock()

	for c := range s.clients {
		c.Done <- struct{}{}
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
		close(c.Send)
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
