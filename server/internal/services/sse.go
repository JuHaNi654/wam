// package service - Server-side events
package services

import (
	"sync"
)

type EventServer struct {
	ConnectClient chan chan []byte
	CloseClient   chan chan []byte
	clients       map[chan []byte]struct{} // Map to keep track of connected clients
	sync          sync.Mutex

	srvWg sync.WaitGroup
	reqWg sync.WaitGroup
}

func NewSSEServer() *EventServer {
	return &EventServer{
		ConnectClient: make(chan chan []byte),
		CloseClient:   make(chan chan []byte),
	}
}
