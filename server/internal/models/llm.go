package models

type HandleModel struct {
	Model string `json:"model" validate:"required"`
}
