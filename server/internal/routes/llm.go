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
	models, err := llm.ListModels(provider)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"provider": provider,
			"models":   models,
			"in_use":   llm.InitializedAgent.Selected(),
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
			"model":    requestBody.Model,
			"provider": provider,
		},
	})

	return nil
}

func toggleModel(ctx *gin.Context, _ *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if llm.InitializedAgent.Selected() != nil {
		llm.InitializedAgent.ClearSelected()
	} else {
		if err := llm.InitializedAgent.UseModel(provider, requestBody.Model); err != nil {
			return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
		}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}

func llmStatus(ctx *gin.Context, _ *services.Service) *ErrorResponse {
	ok, _ := llm.InitializedAgent.ProviderAvailability()

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"in_use":    llm.InitializedAgent.Selected(),
			"available": ok,
		},
	})
	return nil
}
