// Package notification this file handles server-side events from llm
// providers transform to the app notification data structure
package notification

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"net/http"
)

type LLMProviderSSE struct {
	url    string
	notify func(data Payload)
}

func NewLLMSSEClient(url string, notify func(data Payload)) *LLMProviderSSE {
	return &LLMProviderSSE{
		url:    url,
		notify: notify,
	}
}

func (c *LLMProviderSSE) Listen() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New("request returned non 200 status")
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		fmt.Println("SSE:", line)
	}

	return scanner.Err()
}
