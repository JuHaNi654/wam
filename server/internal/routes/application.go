package routes

import (
	"log"
	"net/http"
	"server/internal/agent"
	"server/internal/models"
	"server/internal/parser"
	"server/internal/services"

	"github.com/gin-gonic/gin"
)

func listApplications(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applications, err := s.ApplicationRepository.List()

	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"applications": applications,
		},
	})
	return nil
}

func createApplication(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Application)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	ad, err := parser.Run(&parser.Config{
		URL: requestBody.Link,
	})

	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	requestBody.Ad = ad

	if err := s.ApplicationRepository.Create(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	result, err := agent.ListAdHardSkills(s.Agent, agent.ApplicationInput{
		Ad: requestBody.Ad,
	})

	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	savedSkills := []models.Skill{}
	for _, skill := range result.Skills {
		savedSkill := &models.Skill{
			Name: skill,
		}
		err := s.SkillRepository.Create(savedSkill)
		if err != nil {
			log.Println(err)
			continue
		}

		savedSkills = append(savedSkills, *savedSkill)
	}

	_, err = s.ApplicationRepository.SetSkills(savedSkills, requestBody.ID)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": map[string]any{
			"application": requestBody,
		},
	})

	return nil
}

func getApplicationByID(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Param("id")
	application, err := s.ApplicationRepository.GetByID(applicationID)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	actions, err := s.ActionRepository.GetByJobID(applicationID)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	skills, err := s.SkillRepository.GetByJobID(applicationID)
	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"application": application,
			"actions":     actions,
			"skills":      skills,
		},
	})

	return nil
}

func addSkillsToTheApplication(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Param("id")
	requestBody := new(models.UpdateSkills)

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		return &ErrorResponse{Code: http.StatusBadRequest, LogMessage: err.Error()}
	}

	savedSkills, err := s.ApplicationRepository.SetSkills(requestBody.Skills, applicationID)

	if err != nil {
		return &ErrorResponse{Code: http.StatusInternalServerError, LogMessage: err.Error()}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]any{
			"id":     applicationID,
			"skills": savedSkills,
		},
	})
	return nil
}
