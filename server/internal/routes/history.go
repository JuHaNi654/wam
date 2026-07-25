package routes

import (
	"net/http"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func createWorkHistory(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.History)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.HistoryRepository.Create(requestBody); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       requestBody,
	})
	return nil
}

func updateHistory(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	var requestBody map[string]any
	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.HistoryRepository.Update(id, requestBody); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}

func deleteHistory(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	if err := s.HistoryRepository.Delete(id); err != nil {
		logger.Log.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}
