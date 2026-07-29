package routes

import (
	"net/http"
	"server/internal/notification"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func ping(ctx *gin.Context, s *services.Service) *ErrorResponse {
	notification.GetInstance().Send(notification.Payload{Type: "ping", Content: map[string]any{"msg": "pong"}})
	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"message": "pong",
		},
	})

	return nil
}

func noRoute(ctx *gin.Context) {

	ctx.JSON(http.StatusNotFound, ErrorResponse{
		StatusCode: http.StatusNotFound,
		Message:    "route does not exists",
	})
}
