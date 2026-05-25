// Package agent
package agent

import (
	"context"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

type Agent struct {
	Ctx    context.Context
	GenKit *genkit.Genkit
	Model  ai.Model
}
