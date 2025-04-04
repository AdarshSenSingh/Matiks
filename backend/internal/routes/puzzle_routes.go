package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/handlers"
	"github.com/hectoclash/internal/middleware"
)

// SetupPuzzleRoutes sets up the puzzle routes
func SetupPuzzleRoutes(router *gin.Engine, puzzleHandler *handlers.PuzzleHandler, authMiddleware *middleware.AuthMiddleware) {
	// Create a group for puzzle routes
	puzzleGroup := router.Group("/api/puzzles")
	{
		// Get a puzzle by ID
		puzzleGroup.GET("/:id", authMiddleware.OptionalAuth(), puzzleHandler.GetPuzzle)

		// Get a puzzle suitable for a user's ELO rating (requires authentication)
		puzzleGroup.GET("/user", authMiddleware.RequireAuth(), puzzleHandler.GetPuzzleForUser)

		// Generate a new puzzle
		puzzleGroup.POST("/generate", authMiddleware.OptionalAuth(), puzzleHandler.GeneratePuzzle)

		// Get puzzles suitable for a specific ELO rating
		puzzleGroup.GET("/elo/:elo", authMiddleware.OptionalAuth(), puzzleHandler.GetPuzzlesByELO)

		// Validate a solution for a puzzle (requires authentication)
		puzzleGroup.POST("/:id/validate", authMiddleware.RequireAuth(), puzzleHandler.ValidateSolution)
	}
}