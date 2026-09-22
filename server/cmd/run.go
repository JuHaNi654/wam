// Package cmd
package cmd

import (
	"context"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os/signal"
	"server/internal/database"
	"server/internal/llm"
	"server/internal/logger"
	"server/internal/notification"
	"server/internal/routes"
	"server/internal/services"
	"syscall"
)

const PORT = "8000"

func Run(prompts fs.FS) error {
	// Initialize services
	logger.Init(logger.Echo{})
	notification.Init()
	llm.Init(prompts)

	fmt.Printf("Starting server on port %s...\n", PORT)
	ctx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stop()

	client := database.NewSQLiteClient()
	if err := client.Connect(); err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	service := services.NewService(
		client.GetSession(),
	)
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", PORT),
		Handler: routes.Routes(service),
	}

	fmt.Printf("Server is running on port %s\n", PORT)
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server crashed: %v", err)
		}
	}()

	<-ctx.Done()
	stop()
	log.Println("Shutting down gracefully, press ctrl+c again to force")

	ctx, cancel := context.WithCancel(context.Background())
	notification.GetInstance().Close()
	llm.GetInstance().Close()
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		return err
	}

	return nil
}
