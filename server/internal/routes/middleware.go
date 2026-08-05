package routes

import (
	"net/http"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

type NextFunc func(*gin.Context, *services.Service) *ErrorResponse

func Handler(s *services.Service, next NextFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if err := next(ctx, s); err != nil {
			if err.StatusCode == http.StatusInternalServerError {
				ctx.JSON(http.StatusInternalServerError, ErrorResponse{
					StatusCode: http.StatusInternalServerError,
					Message:    "something went wrong",
				})
				return
			}

			ctx.JSON(err.StatusCode, err)
		}
	}
}

func headers(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Content-Type, Accept, Accept-Language")
	c.Header("Access-Control-Expose-Headers", "Content-Length")
	c.Header("Access-Control-Max-Age", "86400")

	if c.Request.Method == "OPTIONS" {
		c.AbortWithStatus(http.StatusNoContent)
		return
	}

	c.Next()
}
