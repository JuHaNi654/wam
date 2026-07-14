package routes

import (
	"net/http"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func ping(ctx *gin.Context, s *services.Service) *ErrorResponse {
	ctx.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})

	return nil
}

func noRoute(ctx *gin.Context) {
	ctx.JSON(http.StatusNotFound, gin.H{
		"errors": []ErrorGroup{
			{Title: "Route not found"},
		},
	})
}

