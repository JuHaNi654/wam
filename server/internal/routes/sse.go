// Package routes - Server-Side events handler
package routes

import (
	"fmt"
	"server/internal/notification"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func sseHandler(ctx *gin.Context, s *services.Service) *ErrorResponse {
	ctx.Header("Content-Type", "text/event-stream")
	ctx.Header("Cache-Control", "no-cache")
	ctx.Header("Connection", "keep-alive")
	ctx.Header("Access-Control-Allow-Origin", "*")

	client := &notification.Client{
		ID:   uuid.NewString(),
		Send: make(chan []byte, 16),
		Done: make(chan struct{}),
	}

	s.NotificationService.Register(client)
	defer s.NotificationService.UnRegister(client)

	for {
		select {
		case msg := <-client.Send:
			fmt.Fprintf(ctx.Writer, "data: %s\n\n", msg)
			ctx.Writer.Flush()
		case <-client.Done:
			return nil
		case <-ctx.Done():
			return nil
		}
	}
}
