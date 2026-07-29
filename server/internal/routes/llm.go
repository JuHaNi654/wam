package routes

import (
	"errors"
	"net/http"
	"server/internal/llm"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/notification"
	"server/internal/services"
	"strings"

	"github.com/gin-gonic/gin"
)

func listProviders(ctx *gin.Context, s *services.Service) *ErrorResponse {
	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data:       llm.GetInstance().Providers(),
	})

	return nil
}

func listModels(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	models, err := llm.GetInstance().ListModels(provider)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"provider": provider,
			"models":   models,
			"in_use":   llm.GetInstance().Selected(),
		},
	})
	return nil
}

func loadModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	if err := llm.GetInstance().LoadModel(provider, requestBody.Model); err != nil {
		logger.GetInstance().Error(err.Error())
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
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := llm.GetInstance().UnloadModel(provider, requestBody.Model); err != nil {
		logger.GetInstance().Error(err.Error())
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
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if strings.HasSuffix(llm.GetInstance().Selected(), requestBody.Model) {
		llm.GetInstance().ClearSelected()

		notification.Current.Send(notification.Payload{
			Type:    notification.NotificationLLMModelEnabled,
			Content: llm.GetInstance().Selected(),
		})
		ctx.JSON(http.StatusNoContent, gin.H{})
		return nil
	}

	err := llm.GetInstance().Select(provider, requestBody.Model)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, llm.ErrModelNotLoaded) {
			return &ErrorResponse{
				StatusCode: http.StatusBadRequest,
				Message:    err.Error(),
			}
		}
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	notification.Current.Send(notification.Payload{
		Type:    notification.NotificationLLMModelEnabled,
		Content: llm.GetInstance().Selected(),
	})
	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}

func llmStatus(ctx *gin.Context, _ *services.Service) *ErrorResponse {
	ok, _ := llm.GetInstance().ProviderAvailability()

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"in_use":    llm.GetInstance().Selected(),
			"available": ok,
		},
	})

	return nil
}
