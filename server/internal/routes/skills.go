package routes

import (
	"context"
	"errors"
	"net/http"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"
	"server/internal/utils"

	"github.com/gin-gonic/gin"
)

func listAllSkills(ctx *gin.Context, s *services.Service) *ErrorResponse {
	viewType := ctx.DefaultQuery("view", "basic")
	page := ctx.DefaultQuery("page", "1")

	if viewType == "basic" {
		skills, err := s.SkillRepository.List()
		if err != nil {
			logger.GetInstance().Error(err.Error())
			return &ErrorResponse{StatusCode: http.StatusInternalServerError}
		}

		ctx.JSON(http.StatusOK, Response{
			StatusCode: http.StatusOK,
			Data:       skills,
		})
		return nil
	}

	if viewType == "extended" {
		perPage := 10
		pageAsInt, ok := utils.ParsePagination(page)
		if !ok {
			return &ErrorResponse{
				StatusCode: http.StatusBadRequest,
				Message:    "Invalid value for query parameter 'page'",
			}
		}

		totalSkills := s.SkillRepository.GetTotalSkills()
		skills, err := s.SkillRepository.ListExtended(pageAsInt, perPage)
		if err != nil {
			logger.GetInstance().Error(err.Error())
			return &ErrorResponse{StatusCode: http.StatusInternalServerError}
		}

		ctx.JSON(http.StatusOK, Response{
			StatusCode: http.StatusOK,
			Data:       skills,
			Pagination: NewPagination(pageAsInt, int(totalSkills), perPage),
		})
		return nil
	}

	return &ErrorResponse{
		StatusCode: http.StatusBadRequest,
		Message:    "Invalid value for query parameter 'view'",
	}
}

func createSkill(ctx *gin.Context, s *services.Service) *ErrorResponse {
	requestBody := new(models.Skill)
	if err := ctx.ShouldBindJSON(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		return &ErrorResponse{StatusCode: http.StatusBadRequest}
	}

	if err := s.SkillRepository.Create(requestBody); err != nil {
		logger.GetInstance().Error(err.Error())
		if errors.Is(err, repositories.ErrSkillAlreadyExists) {
			return &ErrorResponse{StatusCode: http.StatusConflict, Message: "A skill with that name already exists"}
		}

		if errors.Is(err, repositories.ErrSkillNameRequired) {
			return &ErrorResponse{StatusCode: http.StatusBadRequest}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.JSON(http.StatusCreated, Response{
		StatusCode: http.StatusCreated,
		Data:       requestBody,
	})
	return nil
}

func deleteSkill(ctx *gin.Context, s *services.Service) *ErrorResponse {
	id := ctx.Param("id")
	routeCtx := context.Background()

	if err := s.SkillRepository.Delete(id, &routeCtx); err != nil {
		logger.GetInstance().Error(err.Error())
		msg, ok := routeCtx.Value("message").(string)
		if ok {
			return &ErrorResponse{StatusCode: http.StatusBadRequest, Message: msg}
		}

		return &ErrorResponse{StatusCode: http.StatusInternalServerError}
	}

	ctx.Status(http.StatusNoContent)
	return nil
}
