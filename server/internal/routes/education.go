package routes

import (
	"net/http"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func createEducation(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Education)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.EducationRepository.Create(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": requestBody,
	})
	return nil
}

func deleteEducation(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	if err := s.EducationRepository.Delete(id); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}
