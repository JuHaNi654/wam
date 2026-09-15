package routes

import (
	"context"
	"errors"
	"net/http"
	"server/internal/llm"
	"server/internal/llm/skills"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/scraper"
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

	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if errors, isValid := validateStruct(requestBody); !isValid {
		return &ErrorResponse{StatusCode: http.StatusBadRequest, Validation: errors}
	}

	// If job add link not received, then skip content scraping
	if requestBody.Link != nil {
		settings, err := s.SettingsRepository.Get()
		if err != nil {
			logger.GetInstance().Error(err.Error())
			if errors.Is(err, repositories.ErrSettingsNotInitialized) {
				return &ErrorResponse{
					StatusCode: http.StatusBadRequest,
					Message:    "Settings needs to be initialized before creating new applications",
				}
			}
		}

		ad, err := scraper.Scrape(&scraper.Config{
			URL:              *requestBody.Link,
			AvailableTargets: settings.Targets,
		})

		if err != nil {
			logger.GetInstance().Error(err.Error())
		} else {
			requestBody.Ad = ad
		}
	}
	savedApplication, err := s.ApplicationRepository.Create(*requestBody)
	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	if llm.GetInstance() != nil && llm.GetInstance().Selected() != "" {
		c := context.Background()
		result, err := skills.ListAdHardSkills(&c, llm.GetInstance(), skills.ApplicationInput{
			Ad: savedApplication.Ad,
		})

		if err != nil {
			logger.GetInstance().Error(err.Error())
		} else { // TODO Should this be inside transaction
			savedSkills := []models.Skill{}
			for _, skill := range result.Skills {
				savedSkill := &models.Skill{
					Name: skill,
				}

				err := s.SkillRepository.Create(savedSkill)
				if err != nil {
					logger.GetInstance().Error(err.Error())
					continue
				}

				savedSkills = append(savedSkills, *savedSkill)
			}

			_, err = s.ApplicationRepository.SetSkills(savedSkills, savedApplication.ID)
			if err != nil {
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

	skills, err := s.ApplicationRepository.SetSkills(requestBody.Skills, applicationID)

	if err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusOK, Response{
		StatusCode: http.StatusOK,
		Data: gin.H{
			"id":     applicationID,
			"skills": skills,
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
