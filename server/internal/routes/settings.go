package routes

import (
	"errors"
	"net/http"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getSettings(ctx *gin.Context, s *services.Service) *ErrorResponse {
	settings, err := s.SettingsRepository.Get()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data:       settings,
	})
	return nil
}

func saveSettings(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Settings)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	if err := s.SettingsRepository.Save(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       requestBody,
	})
	return nil
}
