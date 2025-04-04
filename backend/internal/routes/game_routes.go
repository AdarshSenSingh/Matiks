package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/handlers"
	"github.com/hectoclash/internal/middleware"
)

// SetupGameRoutes sets up the game routes
func SetupGameRoutes(router *gin.Engine, gameHandler *handlers.GameHandler, authMiddleware *middleware.AuthMiddleware) {
	// Create a group for game routes
	gameGroup := router.Group("/api/games")
	{
		// Get all active games
		gameGroup.GET("", authMiddleware.OptionalAuth(), gameHandler.GetActiveGames)

		// Create a new game (requires authentication)
		gameGroup.POST("", authMiddleware.RequireAuth(), gameHandler.CreateGame)

		// Get a game by ID
		gameGroup.GET("/:id", authMiddleware.OptionalAuth(), gameHandler.GetGame)

		// Join a game (requires authentication)
		gameGroup.POST("/:id/join", authMiddleware.RequireAuth(), gameHandler.JoinGame)

		// Submit a solution for a game (requires authentication)
		gameGroup.POST("/:id/submit", authMiddleware.RequireAuth(), gameHandler.SubmitSolution)

		// Get duel status (requires authentication)
		gameGroup.GET("/:id/duel", authMiddleware.RequireAuth(), gameHandler.GetDuelStatus)
	}
}