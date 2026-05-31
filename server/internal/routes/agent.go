package routes

import (
	"context"
	"net/http"
	"server/internal/agent"
	"server/internal/ollama"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func getAgentServiceInfo(ctx *gin.Context, s *services.Service) *ErrorResponse {
	err := s.Agent.Ping()
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": ollama.InitializedOllama.ModelStatus,
	})
	return nil
}

func generateSkillsFromAgent(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Query("applicationId")
	application, err := s.ApplicationRepository.GetByID(applicationID)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	c := context.Background()
	result, err := agent.ListAdHardSkills(&c, s.Agent, agent.ApplicationInput{
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
