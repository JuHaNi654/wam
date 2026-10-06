package routes

import (
	"errors"
	"fmt"
	"net/http"
	llmflows "server/internal/llm-flows"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func listApplications(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applications, err := s.ApplicationRepository.List()

	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data:       applications,
	})
	return nil
}

func createApplication(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Application)

	if errResponse := bindAndValidateJSON(ctx, requestBody); errResponse != nil {
		return errResponse
	}

	if err := services.ApplicationFetchAdText(requestBody, s); err != nil {
		logger.GetInstance().Error(err.Error())

		if errors.Is(err, repositories.ErrSettingsNotInitialized) {
			return &ErrorResponse{
				StatusCode: http.StatusBadRequest,
				Message:    "Settings needs to be initialized before creating new applications",
			}
		}
	}

	savedApplication, err := s.ApplicationRepository.Create(*requestBody)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	if s.LLMInstance != nil {
		skills, err := llmflows.HardskillFlow.Run(ctx, llmflows.HardSkillInput{Text: savedApplication.Ad})
		logger.GetInstance().Debug("Hardskillflow returned list of skills")
		logger.GetInstance().Debug(fmt.Sprintf("%+v", skills))

		if err != nil {
			logger.GetInstance().Error(err.Error())
		} else {
			list := []models.Skill{}
			for _, skill := range skills {
				if (skill.Status) == models.NewSkillType {
					if err := s.SkillRepository.Create(&skill.Skill); err != nil {
						logger.GetInstance().Error(err.Error())
						continue
					}

					list = append(list, skill.Base())
				}
			}

			if err = s.ApplicationRepository.SetSkills(list, savedApplication.ID); err != nil {
				logger.GetInstance().Error(err.Error())
			}
		}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       savedApplication,
	})

	return nil
}

func getApplicationByID(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Param("id")
	application, err := s.ApplicationRepository.GetByID(applicationID)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ErrorResponse{
				StatusCode: http.StatusNotFound,
				Message:    "application not found",
			}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	actions, err := s.ActionRepository.GetByApplicationID(applicationID)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	skills, err := s.SkillRepository.GetByJobID(applicationID)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
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
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ApplicationRepository.SetSkills(requestBody.Skills, applicationID); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"id":     applicationID,
			"skills": requestBody.Skills,
		},
	})

	return nil
}

func updateApplication(ctx *gin.Context, s *services.Service) *ErrorResponse {
	applicationID := ctx.Param("id")
	// TODO: update requestBody to valid struct type for possible validations
	var requestBody map[string]any
	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.ApplicationRepository.Update(applicationID, requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.Status(http.StatusNoContent)
	ctx.Writer.WriteHeaderNow()
	return nil
}

func deleteApplication(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	if err := s.ApplicationRepository.Delete(id); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.Status(http.StatusNoContent)
	ctx.Writer.WriteHeaderNow()
	return nil
}
