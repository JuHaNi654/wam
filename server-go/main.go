package main

import (
	"context"
	"embed"
	"fmt"
	"server/cmd"
	"server/internal/agent"
)

//go:embed all:prompts
var prompts embed.FS

func main() {
	ctx := context.Background()
	g, model := agent.OllamaAgent(&ctx, prompts)

	a := &agent.Agent{
		Ctx:    ctx,
		GenKit: g,
		Model:  model,
	}

	fmt.Println("Starting server...")
	if err := cmd.Run(a); err != nil {
		fmt.Printf("Error running server: %v\n", err)
	}
}
