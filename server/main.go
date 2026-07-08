package main

import (
	"embed"
	"fmt"
	"os"
	"server/cmd"
	"server/internal/llm"

	"github.com/joho/godotenv"
)

var commands = []string{"start-server", "migrate"}

//go:embed all:prompts
var prompts embed.FS

func main() {
	argsWithoutProg := os.Args[1:]
	if len(argsWithoutProg) == 0 {
		fmt.Printf("Command is missing\n\nAvailable commands:\n")
		for _, c := range commands {
			fmt.Printf("  - %s\n", c)
		}

		return
	}

	if err := godotenv.Load(); err != nil {
		fmt.Println(".env file not found")
	}

	switch argsWithoutProg[0] {
	case "start-server":
		fmt.Println("Initializing agent")
		llm.Initalize(prompts)

		fmt.Println("Starting server...")
		if err := cmd.Run(); err != nil {
			fmt.Printf("Error running server: %v\n", err)
		}

	case "migrate":
		if err := cmd.Migrate(); err != nil {
			fmt.Println(err)
		}
	default:
		fmt.Println("Invalid command")
	}
}
