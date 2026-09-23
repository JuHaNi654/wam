package routes

import (
	"net/http"
	"os"
	"path/filepath"
	"server/internal/notification"
	"server/internal/services"
	"server/internal/utils"

	"github.com/gin-gonic/gin"
)

func serveClient(ctx *gin.Context, s *services.Service) *ErrorResponse {
	if os.Getenv("MODE") == "development" {
		ctx.Redirect(http.StatusMovedPermanently, os.Getenv("CLIENT_URL"))
		return nil
	}

	path, _ := utils.GetApplicationPath()
	ctx.File(filepath.Join(path, "dist/index.html"))

	return nil
}

func ping(ctx *gin.Context, s *services.Service) *ErrorResponse {
	data := notification.Payload{Type: "ping", Content: map[string]any{"msg": "pong"}}

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
