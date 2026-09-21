package routes

import (
	"net/http"
	"os"
	"path/filepath"
	"server/internal/notification"
	"server/internal/services"
	"server/internal/utils"
	"strings"

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
	appPath, _ := utils.GetApplicationPath()
	distDir := filepath.Join(appPath, "dist")
	indexFile := filepath.Join(distDir, "index.html")

	if os.Getenv("MODE") == "development" {
		ctx.Redirect(http.StatusFound, os.Getenv("CLIENT_URL")+ctx.Request.URL.RequestURI())
		return
	}

	reqPath := ctx.Request.URL.Path

	if (ctx.Request.Method != http.MethodGet && ctx.Request.Method != http.MethodHead) ||
		strings.HasPrefix(reqPath, "/api/") {
		ctx.JSON(http.StatusNotFound, Response{
			StatusCode: http.StatusNotFound,
			Data:       gin.H{"error": "not found"},
		})
		return
	}

	if filepath.Ext(reqPath) != "" {
		ctx.JSON(http.StatusNotFound, Response{
			StatusCode: http.StatusNotFound,
			Data:       gin.H{"error": "not found"},
		})
		return
	}

	// 3. Anything else is a client-side route -> SPA shell
	ctx.Header("Cache-Control", "no-cache")
	ctx.File(indexFile)
}
