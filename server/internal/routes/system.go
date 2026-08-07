package routes

import (
	"fmt"
	"net/http"
	"server/internal/notification"
	"server/internal/services"
	"unsafe"

	"github.com/gin-gonic/gin"
)

func ping(ctx *gin.Context, s *services.Service) *ErrorResponse {
	data := notification.Payload{Type: "ping", Content: map[string]any{"msg": "pong"}}
	fmt.Printf("Size %d bytes\n", unsafe.Sizeof(data))

	notification.GetInstance().Send(data)
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
