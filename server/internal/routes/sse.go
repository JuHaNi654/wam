// Package routes - Server-Side events handler
package routes

import (
	"fmt"
	"net/http"
	"server/internal/services"
	"time"

	"github.com/gin-gonic/gin"
)

func sseHandler(ctx *gin.Context, s *services.Service) *ErrorResponse {
	ctx.Header("Content-Type", "text/event-stream")
	ctx.Header("Cache-Control", "no-cache")
	ctx.Header("Connection", "keep-alive")
	ctx.Header("Access-Control-Allow-Origin", "*")

	clientGone := ctx.Done()

	rc := http.NewResponseController(ctx.Writer)
	t := time.NewTicker(time.Second)
	defer t.Stop()
	for {
		select {
		case <-clientGone:
			fmt.Println("Client disconnected")
			return nil
		case <-t.C:
			_, err := fmt.Fprintf(ctx.Writer, "data: The time is %s\n\n", time.Now().Format(time.UnixDate))
			if err != nil {
				fmt.Println("error when sending sse: ", err.Error())
				return nil
			}

			if err := rc.Flush(); err != nil {
				fmt.Println("error while trying to flush: ", err.Error())
				return nil
			}

		}
	}

}
