package routes

import (
	"net/http"
	"server/internal/agent"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func generateSkillsFromAgent(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Query("applicationId")
	application, err := s.ApplicationRepository.GetByID(applicationID)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	result, err := agent.ListAdHardSkills(s.Agent, agent.ApplicationInput{
		Ad: application.Ad,
	})

	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": result,
	})
	return nil
}
