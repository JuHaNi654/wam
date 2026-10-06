package models

type HandleModel struct {
	Model string `json:"model" validate:"required"`
}

type ActiveModel struct {
	Provider string `json:"provider" validate:"required"`
	Model    string `json:"model" validate:"required"`
}
