package routes

import (
	"net/http"
	"server/internal/llm"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listProviders(ctx *gin.Context, s *services.Service) *ErrorResponse {
	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"providers": llm.Providers(),
		},
	})
	return nil
}

func listModels(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	models := llm.ProviderModels(provider)

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"provider": provider,
			"models":   models,
		},
	})
	return nil
}

func loadModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{Code: http.StatusBadRequest, Errors: errors}
	}

	if err := llm.InitializedAgent.LoadModel(provider, requestBody.Model); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": map[string]any{
			"provider": provider,
			"model":    requestBody.Model,
		},
	})

	return nil
}

func unloadModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := llm.InitializedAgent.UnloadModel(provider, requestBody.Model); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": map[string]any{
			"provider": provider,
			"model":    requestBody.Model,
		},
	})

	return nil
}
