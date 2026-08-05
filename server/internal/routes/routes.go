// Package routes manges all application routing
package routes

import (
	"fmt"
	"server/internal/models"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func Routes(s *services.Service) *gin.Engine {
	initalizeValidator()
	r := gin.Default()
	r.Use(headers)

	// System
	r.GET("/ping", Handler(s, ping))

	// Profile
	r.GET("/api/profile/initialized", Handler(s, checkProfile))
	r.GET("/api/profile", Handler(s, getProfile))
	r.POST("/api/profile", Handler(s, createProfile))
	r.PUT("/api/profile", Handler(s, updateProfile))
	r.POST("/api/profile/skills", Handler(s, saveProfileSkills))

	// Settings
	r.GET("/api/settings", Handler(s, getSettings))
	r.POST("/api/settings", Handler(s, saveSettings))

	// History
	r.POST("/api/profile/history", Handler(s, createWorkHistory))
	r.PUT("/api/profile/history/:id", Handler(s, updateHistory))
	r.DELETE("/api/profile/history/:id", Handler(s, deleteHistory))

	// Skills
	r.GET("/api/skills", Handler(s, listAllSkills))
	r.POST("/api/skills", Handler(s, createSkill))

	// Education
	r.POST("/api/profile/education", Handler(s, createEducation))
	r.DELETE("/api/profile/education/:id", Handler(s, deleteEducation))

	// Applications
	r.GET("/api/applications", Handler(s, listApplications))
	r.POST("/api/applications", Handler(s, createApplication))
	r.GET("/api/applications/:id", Handler(s, getApplicationByID))
	r.PUT("/api/applications/:id", Handler(s, updateApplication))
	r.DELETE("/api/applications/:id", Handler(s, deleteApplication))
	r.POST("/api/applications/:id/skills", Handler(s, addSkillsToTheApplication))
	r.POST("/api/applications/:id/actions", Handler(s, createAction))

	// Actions
	r.PUT("/api/actions/:id", Handler(s, updateAction))
	r.DELETE("/api/actions/:id", Handler(s, deleteAction))

	// llm endpoints
	r.GET("/api/llm/status", Handler(s, llmStatus))
	r.GET("/api/llm/providers", Handler(s, listProviders))
	r.GET("/api/llm/providers/:provider/models", Handler(s, listModels))
	r.POST("/api/llm/providers/:provider/load", Handler(s, loadModel))
	r.POST("/api/llm/providers/:provider/unload", Handler(s, unloadModel))
	r.POST("/api/llm/providers/:provider/toggle", Handler(s, toggleModel))

	// Agent skill endpoints
	r.GET("/api/llm/agent/hardskills", Handler(s, agentListSkills))

	// SSE endpoints
	r.GET("/events", Handler(s, sseHandler))

	// Return 404 from invalid endpoint
	r.NoRoute(noRoute)

	return r
}

func initalizeValidator() {
	validate = validator.New()
	err := validate.RegisterValidation("validate_status", models.ValidateApplicationStatus)
	if err != nil {
		fmt.Println(err)
	}
}
