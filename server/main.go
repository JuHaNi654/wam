package main

import (
	"embed"
	"fmt"
	"os"
	"server/cmd"

	"github.com/joho/godotenv"
)

var commands = []string{"start-server", "migrate", "init-db"}

//go:embed all:prompts
var prompts embed.FS

func main() {
	if os.Getenv("MODE") != "production" {
		if err := godotenv.Load(); err != nil {
			fmt.Println(".env file not found")
		}
	}

	argsWithoutProg := os.Args[1:]
	if len(argsWithoutProg) == 0 {
		fmt.Printf("Command is missing\n\nAvailable commands:\n")
		for _, c := range commands {
			fmt.Printf("  - %s\n", c)
		}
		return
	}

	switch argsWithoutProg[0] {
	case "start-server":
		if err := cmd.Run(prompts); err != nil {
			fmt.Printf("Error running server: %v\n", err)
			os.Exit(1)
		}
	case "migrate":
		if err := cmd.Migrate(); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
	case "init-db":
		if err := cmd.InitializeDatabase(); err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
	default:
		fmt.Println("Invalid command")
		os.Exit(1)
	}
}
