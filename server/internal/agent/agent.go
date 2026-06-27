// Package agent
package agent

import (
	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
)

type Agent interface {
	Model() ai.Model
	Genkit() *genkit.Genkit
}
