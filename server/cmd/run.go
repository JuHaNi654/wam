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
	llm "server/internal/llm"
	llmflows "server/internal/llm-flows"
	llmtools "server/internal/llm-tools"
	"server/internal/logger"
	"server/internal/notification"
	"server/internal/routes"
	"server/internal/services"
	"syscall"
)

const PORT = "8000"

func initLLM(ctx context.Context, prompts fs.FS, s *services.Service) {
	llm.Init(ctx, prompts)
	llmtools.Mount(llm.GetInstance(), s)
	llmflows.Mount(llm.GetInstance())
	s.LLMInstance = llm.GetInstance()
}

func Run(prompts fs.FS) error {
	notifyCtx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stop()

	// Services
	logger.Init(logger.Echo{})
	notification.Init()
	database.InitSQLLite()
	if err := database.GetInstance().Connect(); err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}
	service := services.NewService(database.GetInstance().GetSession())
	initLLM(notifyCtx, prompts, service)

	fmt.Printf("Starting server on port %s...\n", PORT)

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

	<-notifyCtx.Done()
	stop()
	log.Println("Shutting down gracefully, press ctrl+c again to force")

	ctx, cancel := context.WithCancel(context.Background())
	notification.GetInstance().Close()
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		return err
	}

	return nil
}
