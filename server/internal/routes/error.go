package routes

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type ErrorGroup struct {
	Property string `json:"property,omitempty"`
	Title    string `json:"title,omitempty"`
	Message  string `json:"message,omitempty"`
}

type ErrorResponse struct {
	Code       int
	LogMessage string
	Errors     []ErrorGroup
}

func (e *ErrorResponse) Error(path string) string {
	return fmt.Sprintf("Path: %s - Status: %d - Message: %s", path, e.Code, e.LogMessage)
}

func getErrorMessage(tag, param string) string {

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

func validateStruct(body any) (errors []ErrorGroup, isValid bool) {
	if err := validate.Struct(body); err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			msg := getErrorMessage(err.Tag(), err.Param())
			errors = append(errors, ErrorGroup{Property: err.Field(), Title: msg})
		}

		return errors, false
	}

	return errors, true
}

