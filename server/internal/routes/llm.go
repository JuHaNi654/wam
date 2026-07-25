package routes

import (
	"errors"
	"net/http"
	"server/internal/llm"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listProviders(ctx *gin.Context, s *services.Service) *ErrorResponse {
	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data:       llm.Providers(),
	})

	return nil
}

func listModels(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	models, err := llm.ListModels(provider)
	if err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"provider": provider,
			"models":   models,
			"in_use":   llm.Current.Selected(),
		},
	})
	return nil
}

func loadModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	if err := llm.Current.LoadModel(provider, requestBody.Model); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data: gin.H{
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
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := llm.Current.UnloadModel(provider, requestBody.Model); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data: gin.H{
			"model":    requestBody.Model,
			"provider": provider,
		},
	})
	return nil
}

func toggleModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	current := llm.Current.Selected()
	if current != nil && current.Model == requestBody.Model {
		llm.Current.ClearSelected()
		ctx.JSON(http.StatusNoContent, gin.H{})
		return nil
	}

	err := llm.Current.UseModel(provider, requestBody.Model)
	if err != nil {
		logger.Log.Error(err.Error())
		if errors.Is(err, llm.ErrModelNotLoaded) {
			return &ErrorResponse{
				StatusCode: http.StatusBadRequest,
				Message:    err.Error(),
			}
		}
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}

func llmStatus(ctx *gin.Context, _ *services.Service) *ErrorResponse {
	ok, _ := llm.Current.ProviderAvailability()

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"in_use":    llm.Current.Selected(),
			"available": ok,
		},
	})

	return nil
}
