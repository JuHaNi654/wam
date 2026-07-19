// Package parser for parsing job ads
package parser

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"os"
	"time"

	"golang.org/x/net/html"
)

var (
	ErrParserTimeout     = errors.New("request to the website has been timed out")
	ErrInvalidStatusCode = errors.New("request returned invalid status code")
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
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url.String(), nil)
	if err != nil {
		return nil, err
	}
	req.Header = header
	client := &http.Client{}
	res, err := client.Get(url.String())
	if err != nil {
		if os.IsTimeout(err) || errors.Is(err, context.DeadlineExceeded) {
			return nil, ErrParserTimeout
		}

		return nil, err
	}

	defer res.Body.Close()
	if res.StatusCode != 200 {
		return nil, ErrInvalidStatusCode
	}

	doc, err := html.Parse(res.Body)
	if err != nil {
		return nil, err
	}

	return doc, nil

}
