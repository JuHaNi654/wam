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
	validate = validator.New()
	err := validate.RegisterValidation("validate_status", models.ValidateApplicationStatus)
	if err != nil {
		fmt.Println(err)
	}

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

	// Actions
	r.POST("/api/jobs/:id/actions", Handler(s, createAction))
	r.PUT("/api/actions/:id", Handler(s, updateAction))
	r.DELETE("/api/actions/:id", Handler(s, deleteAction))

	// AI agent endpoints
	r.GET("/api/agent", Handler(s, getAgentServiceInfo))
	r.GET("/api/agent/skills", Handler(s, generateSkillsFromAgent))

	// Return 404 from invalid endpoint
	r.NoRoute(noRoute)

	return r
}
