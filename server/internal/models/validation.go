package models

import (
	"github.com/go-playground/validator/v10"
)

// ApplicationStatus enum type
type ApplicationStatus string

func (status ApplicationStatus) Valid() bool {
	switch status {
	case Saved:
		return true
	case Applied:
		return true
	case Interviewing:
		return true
	case Offered:
		return true
	case Rejected:
		return true
	case Withdrawn:
		return true
	}

	return false
}

const (
	Saved        ApplicationStatus = "saved"
	Applied      ApplicationStatus = "applied"
	Interviewing ApplicationStatus = "interviewing"
	Offered      ApplicationStatus = "offered"
	Rejected     ApplicationStatus = "rejected"
	Withdrawn    ApplicationStatus = "withdrawn"
)

func ValidateApplicationStatus(fl validator.FieldLevel) bool {
	field := fl.Field()
	if field.CanInterface() {
		if validatable, ok := field.Interface().(ApplicationStatus); ok {
			return validatable.Valid()
		}
	}

	return false
}
