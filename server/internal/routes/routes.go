// Package routes manges all application routing
package routes

import (
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func Routes(s *services.Service) *gin.Engine {
	r := gin.Default()
	r.Use(headers)

	r.GET("/ping", Handler(s, ping))
	r.GET("/api/initialized", Handler(s, checkProfile))
	r.GET("/api/profile", Handler(s, getProfile))
	r.POST("/api/profile", Handler(s, createProfile))
	r.PUT("/api/profile", Handler(s, updateProfile))
	r.POST("/api/profile/history", Handler(s, createWorkHistory))
	r.PUT("/api/profile/history/:id", Handler(s, updateHistory))
	r.POST("/api/profile/skills", Handler(s, saveProfileSkills))
	r.POST("/api/profile/education", Handler(s, createEducation))
	r.GET("/api/jobs", Handler(s, listApplications))
	r.POST("/api/jobs", Handler(s, createApplication))
	r.GET("/api/jobs/:id", Handler(s, getApplicationByID))
	r.PUT("/api/jobs/:id", Handler(s, updateApplication))
	r.GET("/api/skills", Handler(s, listAllSkills))
	r.POST("/api/skills", Handler(s, createSkill))
	r.POST("/api/jobs/:id/actions", Handler(s, createAction))
	r.PUT("/api/actions/:id", Handler(s, updateAction))
	r.POST("/api/jobs/:id/skills", Handler(s, addSkillsToTheApplication))

	// AI agent endpoints
	r.GET("/api/agent", Handler(s, getAgentServiceInfo))
	r.GET("/api/agent/skills", Handler(s, generateSkillsFromAgent))

	// Return 404 from invalid endpoint
	r.NoRoute(noRoute)

	return r
}
