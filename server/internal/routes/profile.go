package routes

import (
	"errors"
	"net/http"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func checkProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	_, err := s.ProfileRepository.Get()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errors := []ErrorGroup{{Title: "profile not found"}}
			return &ErrorResponse{Code: http.StatusNotFound, LogMessage: err.Error(), Errors: errors}
		}

		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{})
	return nil
}

func getProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	profile, err := s.ProfileRepository.Get()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errors := []ErrorGroup{{Title: "profile not found"}}
			return &ErrorResponse{Code: http.StatusNotFound, LogMessage: err.Error(), Errors: errors}
		}

		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	skills, err := s.ProfileRepository.Skills()
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"profile": profile,
			"skills":  skills,
		},
	})
	return nil
}

func createProfile(ctx *gin.Context, s *services.Service) *ErrorResponse {
	profile, err := s.ProfileRepository.Create()
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": map[string]any{
			"profile": profile,
		},
	})
	return nil
}

func saveProfileSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.UpdateSkills)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.ProfileRepository.SetSkills(requestBody.Skills); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{})
	return nil
}
