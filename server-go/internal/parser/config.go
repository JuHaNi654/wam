package parser

import (
	"slices"
	"strings"

	"golang.org/x/net/html"
)

type Service struct {
	Host        string
	TargetClass string
}

func (s Service) FindTarget(node *html.Node) *html.Node {
	var crawler func(*html.Node)
	var target *html.Node
	crawler = func(node *html.Node) {
		if s.CheckTarget(node) {
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

func (s Service) CheckTarget(node *html.Node) bool {
	return slices.ContainsFunc(node.Attr, func(attr html.Attribute) bool {
		return attr.Key == "class" && strings.Contains(attr.Val, s.TargetClass)
	})
}

var Services = []Service{
	{Host: "duunitori.fi", TargetClass: "description--jobentry"},
	{Host: "jobly.fi", TargetClass: "node--job-per-template--full"},
}
