// Package scraper, fetch document from given url and parsers content
// of saved domain target clas to markdown format
package scraper

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"server/internal/logger"
	"server/internal/models"
	"slices"
	"strings"
	"time"

	"golang.org/x/net/html"
)

var (
	ErrParserTimeout     = errors.New("request to the website has been timed out")
	ErrInvalidStatusCode = errors.New("request returned invalid status code")
	ErrTargetNotSet      = errors.New("target settings is not set for to extracting content")

	header = http.Header{
		"User-Agent": {"Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0"},
	}
	whitespaceRe = regexp.MustCompile(`\s+`)
)

type Config struct {
	URL              string
	AvailableTargets []models.Target
}

func Scrape(config *Config) (string, error) {
	url, err := url.Parse(config.URL)
	if err != nil {
		return "", err
	}

	document, err := fetchDocument(url)
	if err != nil {
		return "", err
	}

	return extractContent(config, document)
}

func extractContent(config *Config, node *html.Node) (string, error) {
	if len(config.AvailableTargets) == 0 {
		return "", ErrTargetNotSet
	}

	var b strings.Builder
	// TODO: maybe is to strict check, ex. if url with https:// is checked against
	// wihtout it would return false
	targetIdx := slices.IndexFunc(config.AvailableTargets, func(t models.Target) bool { return strings.HasPrefix(config.URL, t.URL) })
	if targetIdx == -1 {
		return "", ErrTargetNotSet
	}
	target := config.AvailableTargets[targetIdx]
	logger.GetInstance().Debug(fmt.Sprintf("Handling document: from %s", target.URL))
	logger.GetInstance().Debug(fmt.Sprintf("Looking for target (%s)", target.TargetClass))
	if err := scan(&b, node, target); err != nil {
		return "", err
	}

	return b.String(), nil
}

func scan(b *strings.Builder, node *html.Node, target models.Target) error {
	targetNode := findTarget(node, target.TargetClass)
	if targetNode == nil {
		logger.GetInstance().Debug(fmt.Sprintf("Target not found (%s)", target.TargetClass))
		return errors.New("target node not found") // TODO: rewrite error message
	}

	var crawler func(*html.Node)
	crawler = func(node *html.Node) {

		if node.Type == html.TextNode && len(node.Data) > 1 {
			b.WriteString("\n")
			b.WriteString(getNodeText(node))
			b.WriteString("\n")
		} else {
			switch node.Data {
			case "p":
				b.WriteString("\n")
				b.WriteString(getNodeText(node))
				b.WriteString("\n")
				return
			case "li":
				b.WriteString("- ")
				b.WriteString(getNodeText(node))
				b.WriteString("\n")
				return
			}
		}

		for childNode := node.FirstChild; childNode != nil; childNode = childNode.NextSibling {
			crawler(childNode)
		}
	}

	crawler(targetNode)
	return nil
}

func getNodeText(node *html.Node) string {
	text := ""
	var crawler func(*html.Node)
	crawler = func(node *html.Node) {
		if node.Type == html.TextNode && node.Data != "" {
			text += strings.TrimSpace(node.Data)
		}

		for child := node.FirstChild; child != nil; child = child.NextSibling {
			crawler(child)
		}
	}
	crawler(node)
	return whitespaceRe.ReplaceAllString(text, " ")
}

func findTarget(node *html.Node, targetAttrib string) *html.Node {
	var crawler func(*html.Node)
	var target *html.Node
	crawler = func(node *html.Node) {
		isValid := slices.ContainsFunc(node.Attr, func(attr html.Attribute) bool {
			return attr.Key == "class" && strings.Contains(attr.Val, targetAttrib)
		})

		if isValid {
			target = node
			return
		}

		for childNode := node.FirstChild; childNode != nil; childNode = childNode.NextSibling {
			crawler(childNode)
		}
	}

	crawler(node)
	return target
}

func fetchDocument(url *url.URL) (*html.Node, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url.String(), nil)
	if err != nil {
		return nil, err
	}
	req.Header = header
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		if os.IsTimeout(err) || errors.Is(err, context.DeadlineExceeded) {
			return nil, ErrParserTimeout
		}

		return nil, err
	}

	defer res.Body.Close()
	if res.StatusCode != 200 {
		logger.GetInstance().Debug(fmt.Sprintf("Document request status code: %d", res.StatusCode))
		return nil, ErrInvalidStatusCode
	}

	doc, err := html.Parse(res.Body)
	if err != nil {
		return nil, err
	}

	return doc, nil
}
