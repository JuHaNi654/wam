package routes

import (
	"net/http"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func createAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	jobID := ctx.Param("id")
	requestBody := new(models.Action)
	requestBody.JobID = jobID

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.ActionRepository.Create(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": requestBody,
	})

	return nil
}

func updateAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	var requestBody map[string]any

	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.ActionRepository.Update(id, requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})

	return nil
}

func deleteAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	if err := s.ActionRepository.Delete(id); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}
