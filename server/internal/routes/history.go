package routes

import (
	"net/http"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func createWorkHistory(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.History)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.HistoryRepository.Create(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": requestBody,
	})
	return nil
}

func updateHistory(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	var requestBody map[string]any
	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.HistoryRepository.Update(id, requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}
