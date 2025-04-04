package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/config"
	"github.com/hectoclash/internal/handlers"
	"github.com/hectoclash/internal/middleware"
	"github.com/hectoclash/internal/repository"
	"github.com/hectoclash/internal/routes"
	"github.com/hectoclash/internal/services"
)

func main() {
	fmt.Println("Starting HectoClash server...")

	// Initialize configuration
	cfg := config.Load()

	// Set Gin mode based on environment
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create a new Gin router
	router := gin.Default()

	// Setup CORS middleware
	router.Use(middleware.SetupCORS(cfg))

	// Setup database connection
	db, err := repository.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg)

	// Initialize middlewares
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, cfg)

	// Setup routes
	routes.SetupAuthRoutes(router, authHandler, authMiddleware)

	// Health check route
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
			"env":     cfg.Server.Env,
		})
	})

	// Start HTTP server
	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server running on %s in %s mode", serverAddr, cfg.Server.Env)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
