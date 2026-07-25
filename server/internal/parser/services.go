package parser

import (
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"server/internal/logger"
	"strings"

	"golang.org/x/net/html"
)

var whitespaceRe = regexp.MustCompile(`\s+`)

func parse(url *url.URL, node *html.Node) (string, error) {
	var b strings.Builder

	for _, service := range Services {
		if service.Host != url.Host {
			continue
		}

		logger.Log.Debug(fmt.Sprintf("Handling document from: %s", service.Host))
		if err := scanContent(&b, node, service); err != nil {
			return "", err
		}
	}

	return b.String(), nil
}

func scanContent(b *strings.Builder, page *html.Node, s Service) error {
	target := s.FindTarget(page)
	if target == nil {
		return errors.New("target node not found")
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

	crawler(target)
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
