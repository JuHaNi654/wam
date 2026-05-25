package routes

import (
	"errors"
	"net/http"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listAllSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	skills, err := s.SkillRepository.List()
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"skills": skills,
		},
	})
	return nil
}

func createSkill(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Skill)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	if err := s.SkillRepository.Create(requestBody); err != nil {
		if errors.Is(err, repositories.ErrSkillAlreadyExists) {
			return &ErrorResponse{Code: http.StatusConflict, LogMessage: err.Error()}
		}

		if errors.Is(err, repositories.ErrSkillNameRequired) {
			return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
		}

		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": map[string]any{
			"skill": requestBody,
		},
	})

	return nil
}
