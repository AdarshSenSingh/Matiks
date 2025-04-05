package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/hectoclash/internal/config"
	"github.com/hectoclash/internal/game"
	"github.com/hectoclash/internal/handlers"
	"github.com/hectoclash/internal/matchmaking"
	"github.com/hectoclash/internal/middleware"
	"github.com/hectoclash/internal/puzzle"
	"github.com/hectoclash/internal/repository"
	"github.com/hectoclash/internal/routes"
	"github.com/hectoclash/internal/services"
	"github.com/hectoclash/internal/websocket"
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

	// Initialize Redis client
	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.URL,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Initialize WebSocket hub
	// We'll set the matchmaking service after it's initialized
	wsHub := websocket.NewHub(nil)
	go wsHub.Run()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB)
	gameRepo := repository.NewGameRepository(db.DB)
	puzzleRepo := repository.NewPuzzleRepository(db.DB)
	// Initialize solution metrics repository for future use
	_ = repository.NewSolutionMetricsRepository(db.DB)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg)
	puzzleService := puzzle.NewService(puzzleRepo, userRepo, db.DB)

	// Initialize event service
	eventService := game.NewEventService(wsHub)

	// Initialize game service
	gameService := game.NewService(gameRepo, userRepo, puzzleService, eventService)

	// Initialize matchmaking service
	matchmakingService := matchmaking.NewService(redisClient, userRepo, gameService, wsHub)
	go matchmakingService.Start()

	// Set the matchmaking service in the WebSocket hub
	wsHub.SetMatchmakingService(matchmakingService)

	// Initialize middlewares
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, cfg)
	gameHandler := handlers.NewGameHandler(gameService)
	puzzleHandler := handlers.NewPuzzleHandler(puzzleService, puzzleRepo, userRepo)
	wsHandler := websocket.NewHandler(wsHub)
	matchmakingHandler := handlers.NewMatchmakingHandler(matchmakingService)

	// Setup routes
	routes.SetupAuthRoutes(router, authHandler, authMiddleware)
	routes.SetupGameRoutes(router, gameHandler, authMiddleware)
	routes.SetupPuzzleRoutes(router, puzzleHandler, authMiddleware)
	routes.SetupMatchmakingRoutes(router, matchmakingHandler, authMiddleware)
	routes.RegisterWebSocketRoutes(router, wsHandler, authMiddleware)

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