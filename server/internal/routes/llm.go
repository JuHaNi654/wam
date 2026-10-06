package routes

import (
	"errors"
	"net/http"
	llm "server/internal/llm"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listProviders(ctx *gin.Context, s *services.Service) *ErrorResponse {
	viewType := ctx.DefaultQuery("view", "basic")

	if viewType == "basic" {
		ctx.JSON(http.StatusOK, Response{
			StatusCode: http.StatusOK,
			Data:       llm.GetInstance().ListProviders(),
		})

		return nil
	}

	if viewType == "extended" {
		items := []gin.H{}
		providers := llm.GetInstance().ListProviders()

		for _, provider := range providers {
			if !provider.Available {
				items = append(items, gin.H{
					"provider": provider,
					"models":   []any{},
				})
				continue
			}

			models, err := llm.GetInstance().ListProviderModels(provider.Name)
			if err != nil {
				logger.GetInstance().Error(err.Error())
				items = append(items, gin.H{
					"provider": provider,
					"models":   []any{},
				})
				continue
			}

			items = append(items, gin.H{
				"provider": provider,
				"models":   models,
			})
		}

		ctx.JSON(http.StatusOK, Response{
			StatusCode: http.StatusOK,
			Data: gin.H{
				"items":  items,
				"in_use": llm.GetInstance().Active(),
			},
		})

		return nil
	}

	return &ErrorResponse{
		StatusCode: http.StatusBadRequest,
		Message:    "Invalid value for query parameter 'view'",
	}
}

func listModels(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	models, err := llm.GetInstance().ListProviderModels(provider)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"provider": provider,
			"models":   models,
			"in_use":   llm.GetInstance().Active(),
		},
	})
	return nil
}

func enableModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	if err := llm.GetInstance().EnableModel(provider, requestBody.Model); err != nil {
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

func disableModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	provider := ctx.Param("provider")
	requestBody := new(models.HandleModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	if err := llm.GetInstance().DisableModel(provider, requestBody.Model); err != nil {
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

func setSelectedModel(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.ActiveModel)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	err := llm.GetInstance().SetActive(requestBody.Provider, requestBody.Model)
	if err != nil {
		logger.GetInstance().Error(err.Error())

		if errors.Is(err, llm.ErrProviderNotAvailable) {
			return &ErrorResponse{StatusCode: http.StatusBadRequest, Message: err.Error()}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.Status(http.StatusNoContent)
	return nil
}
