package scraper

import (
	"strings"
	"testing"

	"server/internal/logger"
	"server/internal/models"

	"golang.org/x/net/html"
)

func TestScanCleansExtractedHTML(t *testing.T) {
	logger.Init(logger.NoLog{})

	document, err := html.Parse(strings.NewReader(`
		<div class="article">
			<p>First paragraph</p>
			<p>Second paragraph</p>
			<ul><li>First item</li><li>Second item</li></ul>
		</div>
	`))
	if err != nil {
		t.Fatalf("parse HTML: %v", err)
	}

	var output strings.Builder
	err = scan(&output, document, models.Target{TargetClass: "article"})
	if err != nil {
		t.Fatalf("scan HTML: %v", err)
	}

	got := cleanText(output.String())
	want := "First paragraph\n\nSecond paragraph\n\n- First item\n- Second item"
	if got != want {
		t.Errorf("cleaned output = %q, want %q", got, want)
	}
}

func TestCleanTextNormalizesNewlines(t *testing.T) {
	got := cleanText("\r\n  First\r\n\r\n\r\nSecond  \r\n")
	want := "First\n\nSecond"
	if got != want {
		t.Errorf("cleanText() = %q, want %q", got, want)
	}
}
