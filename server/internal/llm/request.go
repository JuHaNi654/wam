package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"time"
)

var timeout = time.Millisecond * 10_000

type statusCode int

func get[responseBody any](url string, body *responseBody) (statusCode, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return -1, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout))
	defer cancel()
	req = req.WithContext(ctx)
	c := &http.Client{}
	res, err := c.Do(req)
	if err != nil {
		return -1, err
	}
	defer res.Body.Close()

	if body != nil {
		if err := json.NewDecoder(res.Body).Decode(body); err != nil {
			return -1, err
		}
	}

	return statusCode(res.StatusCode), nil
}

func post[responseBody any](url string, requestBody any, body *responseBody) (statusCode, error) {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(requestBody); err != nil {
		return -1, err
	}

	req, err := http.NewRequest(http.MethodPost, url, &buf)
	if err != nil {
		return -1, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout))
	defer cancel()
	req = req.WithContext(ctx)
	c := &http.Client{}
	res, err := c.Do(req)
	if err != nil {
		return -1, err
	}
	defer res.Body.Close()

	if body != nil {
		if err := json.NewDecoder(res.Body).Decode(body); err != nil {
			return -1, err
		}
	}

	return statusCode(res.StatusCode), nil
}
