package routes

import (
	"errors"
	"net/http"
	llmflows "server/internal/llm-flows"
	"server/internal/logger"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func flowListSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Query("applicationId")

	application, err := s.ApplicationRepository.GetByID(applicationID)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ErrorResponse{
				StatusCode: http.StatusInternalServerError,
				Message:    "Application not found",
			}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	skills, err := llmflows.HardskillFlow.Run(ctx, llmflows.HardSkillInput{Text: application.Ad})

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
