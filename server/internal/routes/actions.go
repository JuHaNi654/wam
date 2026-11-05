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

func createAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Param("id")
	requestBody := new(models.Action)
	requestBody.ApplicationID = applicationID

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	savedAction, err := s.ActionRepository.Create(requestBody)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	if err := s.ApplicationRepository.UpdateModifiedDate(applicationID); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       savedAction,
	})

	return nil
}

func updateAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")

	action, err := s.ActionRepository.GetByID(id)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ErrorResponse{
				StatusCode: http.StatusNotFound,
				Message:    "action not found",
			}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	// TODO: update requestBody to valid struct type for possible validations
	var requestBody map[string]any

	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ActionRepository.Update(id, requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	if err := s.ApplicationRepository.UpdateModifiedDate(action.ApplicationID); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	ctx.Status(http.StatusNoContent)
	return nil
}

func deleteAction(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")

	action, err := s.ActionRepository.GetByID(id)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ErrorResponse{
				StatusCode: http.StatusNotFound,
				Message:    "action not found",
			}
		}
	}

	if err := s.ActionRepository.Delete(id); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	if err := s.ApplicationRepository.UpdateModifiedDate(action.ApplicationID); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	ctx.Status(http.StatusNoContent)
	return nil
}
