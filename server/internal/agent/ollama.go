package agent

import (
	"context"
	"io/fs"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
)

func OllamaAgent(ctx *context.Context, embed fs.FS) (*genkit.Genkit, ai.Model) {
	plugin := &ollama.Ollama{
		ServerAddress: "http://127.0.0.1:11434",
		Timeout:       60,
	}

	g := genkit.Init(
		(*ctx),
		genkit.WithPlugins(plugin),
		genkit.WithPromptFS(embed),
	)

	return g, plugin.DefineModel(
		g, ollama.ModelDefinition{
			Name: "gemma4:e4b",
			Type: "chat", // "chat" or "generate"
		},
		&ai.ModelOptions{
			Supports: &ai.ModelSupports{
				Multiturn:  true,
				SystemRole: true,
				Tools:      false,
				Media:      false,
			},
		},
	)
}
