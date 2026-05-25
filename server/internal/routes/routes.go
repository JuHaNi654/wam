// Package routes manges all application routing
package routes

import (
	"net/http"
	"server/internal/agent"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func test(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	application, err := s.ApplicationRepository.GetByID(id)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	result, err := agent.ListAdHardSkills(s.Agent, agent.ApplicationInput{
		Ad: application.Ad,
	})

	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"id":     id,
			"skills": result.Skills,
		},
	})
	return nil
}

func Routes(s *services.Service) *gin.Engine {
	// This function is intentionally left blank. The actual route definitions are in the individual route files (e.g., jobs.go, skills.go).
	r := gin.Default()
	r.Use(headers)

	r.GET("/ping", Handler(s, ping))
	r.GET("/test/:id", Handler(s, test))

	r.GET("/api/jobs", Handler(s, listApplications))
	r.POST("/api/jobs", Handler(s, createApplication))
	r.GET("/api/jobs/:id", Handler(s, getApplicationByID))
	r.GET("/api/skills", Handler(s, listAllSkills))
	r.POST("/api/skills", Handler(s, createSkill))
	r.POST("/api/jobs/:id/actions", Handler(s, createNewJobAction))
	r.POST("/api/jobs/:id/skills", Handler(s, addSkillsToTheApplication))

	// Return 404 from invalid endpoint
	r.NoRoute(noRoute)

	return r
}
