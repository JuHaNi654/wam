package cmd

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"server/internal/agent"
	"server/internal/routes"
	"server/internal/services"
	"syscall"
	"time"
)

const PORT = "8000"

func Run(agent *agent.Agent) error {
	fmt.Printf("Starting server on port %s...\n", PORT)
	ctx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stop()

	db, err := services.IntiSqlite()
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", PORT),
		Handler: routes.Routes(services.NewService(db, agent)),
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		return err
	}

	return nil
}
