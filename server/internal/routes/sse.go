// Package routes - Server-Side events handler
package routes

import (
	"fmt"
	"net/http"
	"server/internal/notification"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func sseHandler(ctx *gin.Context, _ *services.Service) *ErrorResponse {
	ctx.Header("Content-Type", "text/event-stream")
	ctx.Header("Cache-Control", "no-cache")
	ctx.Header("Connection", "keep-alive")
	ctx.Header("Access-Control-Allow-Origin", "*")

	ctx.Writer.WriteHeader(http.StatusOK)
	ctx.Writer.Flush()

	client := &notification.Client{
		ID:   uuid.NewString(),
		Send: make(chan []byte, 16),
		Done: make(chan struct{}, 1),
	}

	instance := notification.GetInstance()

	instance.Register(client)
	defer instance.UnRegister(client)

	for {
		select {
		case msg := <-client.Send:
			fmt.Fprintf(ctx.Writer, "data: %s\n\n", msg)
			ctx.Writer.Flush()
		case <-client.Done:
			instance.UnRegister(client)
			return nil
		case <-ctx.Done():
			return nil
		}
	}
}
