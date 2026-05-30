package main

import (
	"embed"
	"fmt"
	"server/cmd"
	"server/internal/ollama"

	"github.com/joho/godotenv"
)

//go:embed all:prompts
var prompts embed.FS

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println(".env file not found")
	}

	ollama.Initalize(prompts)

	fmt.Println("Starting server...")
	if err := cmd.Run(); err != nil {
		fmt.Printf("Error running server: %v\n", err)
	}
}
