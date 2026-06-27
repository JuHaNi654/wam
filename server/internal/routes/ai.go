package routes

import (
	"net/http"
	"server/internal/ai"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listModels(ctx *gin.Context, s *services.Service) *ErrorResponse {
	models, err := ai.InitializedAgent.Models()
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"models": models,
	})
	return nil
}

/*
func getAgentServiceInfo(ctx *gin.Context, s *services.Service) *ErrorResponse {
	err := s.Agent.Ping()
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": ai.InitializedOllama.ModelStatus,
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
*/
