package routes

import (
	"errors"
	"net/http"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listAllSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	skills, err := s.SkillRepository.List()
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data:       skills,
	})
	return nil
}

func createSkill(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Skill)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.SkillRepository.Create(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, repositories.ErrSkillAlreadyExists) {
			return &ErrorResponse{StatusCode: http.StatusConflict, Message: "a skill with that name already exists"}
		}

		if errors.Is(err, repositories.ErrSkillNameRequired) {
			return &ErrorResponse{StatusCode: http.StatusBadRequest}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       requestBody,
	})
	return nil
}
