package routes

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type Pagination struct {
	Current    int `json:"current"`
	TotalPages int `json:"total_pages"`
	Previous   int `json:"previous"`
	Next       int `json:"next"`
}

func NewPagination(currentPage, totalItems, perPage int) Pagination {
	totalPages := (totalItems + perPage - 1) / perPage
	p := Pagination{
		Current:    currentPage,
		TotalPages: totalPages,
		Previous:   1,
		Next:       totalPages,
	}

	if currentPage < totalPages {
		p.Next = currentPage + 1
	}

	if currentPage > 1 {
		p.Previous = currentPage - 1
	}

	return p
}

type Response struct {
	StatusCode int        `json:"status"`
	Data       any        `json:"data,omitempty"`
	Pagination Pagination `json:"pagination,omitempty"`
}

type ErrorResponse struct {
	StatusCode int             `json:"status"`
	Message    string          `json:"message"`
	Validation []PropertyError `json:"validation"`
}

type PropertyError struct {
	Property string `json:"property,omitempty"`
	Title    string `json:"title,omitempty"`
	Message  string `json:"message,omitempty"`
}

func (e *ErrorResponse) Error(path string) string {
	return fmt.Sprintf("Path: %s - Message: %s", path, e.Message)
}

func getPropertyErrorMessage(tag, param string) string {
	switch tag {
	case "https_url":
		return "(https://) needs to be included"
	case "validate_status":
		return "Invalid status type"
	case "required":
		return "Field is required"
	case "max":
		return fmt.Sprintf("Content length must be max. %s characters long", param)
	case "min":
		return fmt.Sprintf("Content length must be min. %s characters long", param)
	default:
		return "Invalid value"
	}
}

func validateStruct(body any) (errors []PropertyError, isValid bool) {
	if err := validate.Struct(body); err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			msg := getPropertyErrorMessage(err.Tag(), err.Param())
			errors = append(errors, PropertyError{Property: err.Field(), Title: msg})
		}

		return errors, false
	}

	return errors, true
}
