// Package parser for parsing job ads
package parser

import (
	"net/http"
	"net/url"

	"golang.org/x/net/html"
)

var header = http.Header{
	"User-Agent": {"Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0"},
}

type Config struct {
	URL string
}

func Run(config *Config) (string, error) {
	u, err := url.Parse(config.URL)
	if err != nil {
		return "", err
	}

	node, err := fetchDocument(u)
	if err != nil {
		return "", err
	}

	text, err := parse(u, node)
	if err != nil {
		return "", err
	}

	return text, nil
}

func fetchDocument(url *url.URL) (*html.Node, error) {
	client := http.Client{}
	req, err := http.NewRequest("GET", url.String(), nil)
	if err != nil {
		return nil, err
	}

	req.Header = header

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()
	doc, err := html.Parse(res.Body)
	if err != nil {
		return nil, err
	}

	return doc, nil
}
