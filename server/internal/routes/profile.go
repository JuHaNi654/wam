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

func checkProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	_, err := s.ProfileRepository.Get()
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ErrorResponse{StatusCode: http.StatusNotFound, Message: "profile not found"}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, gin.H{})
	return nil
}

func getProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	profile, err := s.ProfileRepository.Get()
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ErrorResponse{StatusCode: http.StatusNotFound, Message: "profile not found"}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	skills, err := s.ProfileRepository.Skills()
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	history, err := s.HistoryRepository.ListByProfileID(profile.ID)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	education, err := s.EducationRepository.ListByProfileID(profile.ID)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"profile":   profile,
			"skills":    skills,
			"history":   history,
			"education": education,
		},
	})
	return nil
}

func createProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	profile, err := s.ProfileRepository.Create()
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       profile,
	})
	return nil
}

func updateProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Profile)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ProfileRepository.Update(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.Status(http.StatusNoContent)
	return nil
}

func saveProfileSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.UpdateSkills)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ProfileRepository.SetSkills(requestBody.Skills); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, gin.H{})
	return nil
}
