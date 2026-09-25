// Package routes manges all application routing
package routes

import (
	"fmt"
	"path/filepath"
	"server/internal/models"
	"server/internal/services"
	"server/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func Routes(s *services.Service) *gin.Engine {
	initalizeValidator()
	r := gin.Default()
	r.Use(headers)

	{
		v1 := r.Group("/api")

		// Profile
		v1.GET("/profile/initialized", Handler(s, checkProfile))
		v1.GET("/profile", Handler(s, getProfile))
		v1.POST("/profile", Handler(s, createProfile))
		v1.PUT("/profile", Handler(s, updateProfile))
		v1.POST("/profile/skills", Handler(s, saveProfileSkills))

		// Settings
		v1.GET("/settings", Handler(s, getSettings))
		v1.POST("/settings", Handler(s, saveSettings))

		// History
		v1.POST("/profile/history", Handler(s, createWorkHistory))
		v1.PUT("/profile/history/:id", Handler(s, updateHistory))
		v1.DELETE("/profile/history/:id", Handler(s, deleteHistory))

		// Skills
		v1.GET("/skills", Handler(s, listAllSkills))
		v1.POST("/skills", Handler(s, createSkill))
		v1.DELETE("/skills/:id", Handler(s, deleteSkill))

		// Education
		v1.POST("/profile/education", Handler(s, createEducation))
		v1.DELETE("/profile/education/:id", Handler(s, deleteEducation))

		// Applications
		v1.GET("/applications", Handler(s, listApplications))
		v1.POST("/applications", Handler(s, createApplication))
		v1.GET("/applications/:id", Handler(s, getApplicationByID))
		v1.PUT("/applications/:id", Handler(s, updateApplication))
		v1.DELETE("/applications/:id", Handler(s, deleteApplication))
		v1.POST("/applications/:id/skills", Handler(s, addSkillsToTheApplication))
		v1.POST("/applications/:id/actions", Handler(s, createAction))

		// Actions
		v1.PUT("/actions/:id", Handler(s, updateAction))
		v1.DELETE("/actions/:id", Handler(s, deleteAction))

		// llm endpoints
		v1.GET("/llm/status", Handler(s, llmStatus))
		v1.GET("/llm/providers", Handler(s, listProviders))
		v1.GET("/llm/providers-models", Handler(s, listProviderModels))
		v1.GET("/llm/providers/:provider/models", Handler(s, listModels))
		v1.POST("/llm/providers/:provider/load", Handler(s, loadModel))
		v1.POST("/llm/providers/:provider/unload", Handler(s, unloadModel))
		v1.POST("/llm/providers/:provider/toggle", Handler(s, toggleModel))

		// Agent skill endpoints
		v1.GET("/llm/agent/hardskills", Handler(s, agentListSkills))

		// SSE endpoints
		v1.GET("/events", Handler(s, sseHandler))
	}

	{
		assets := r.Group("/assets")
		path, _ := utils.GetApplicationPath()
		assets.Static("/", filepath.Join(path, "dist/assets"))
	}

	// System
	//r.GET("/ping", Handler(s, ping))
	r.GET("/", Handler(s, serveClient))
	r.GET("/:path", Handler(s, serveClient))
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
