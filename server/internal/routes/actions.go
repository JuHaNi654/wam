package routes

import (
	"net/http"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func createAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	jobID := ctx.Param("id")
	requestBody := new(models.Action)
	requestBody.ApplicationID = jobID

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ActionRepository.Create(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       requestBody,
	})

	return nil
}

func updateAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	var requestBody map[string]any

	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ActionRepository.Update(id, requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})

	return nil
}

func deleteAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	if err := s.ActionRepository.Delete(id); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
	return nil
}
