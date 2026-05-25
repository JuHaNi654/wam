package routes

import (
	"net/http"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func createNewJobAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
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
