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
		s.Logger.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.EducationRepository.Create(requestBody); err != nil {
		s.Logger.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       requestBody,
	})
	return nil
}

func deleteEducation(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	if err := s.EducationRepository.Delete(id); err != nil {
		s.Logger.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}
