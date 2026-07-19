package routes

import (
	"context"
	"net/http"
	"server/internal/llm"
	"server/internal/llm/skills"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func agentListSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Query("applicationId")

	application, err := s.ApplicationRepository.GetByID(applicationID)
	if err != nil {
		s.Logger.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	c := context.Background()
	result, err := skills.ListAdHardSkills(&c, llm.InitializedAgent, skills.ApplicationInput{
		Ad: application.Ad,
	})

	if err != nil {
		s.Logger.Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data:       result,
	})
	return nil
}
