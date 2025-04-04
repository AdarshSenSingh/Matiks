package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/handlers"
	"github.com/hectoclash/internal/middleware"
)

// SetupMatchmakingRoutes sets up the matchmaking routes
func SetupMatchmakingRoutes(router *gin.Engine, matchmakingHandler *handlers.MatchmakingHandler, authMiddleware *middleware.AuthMiddleware) {
	// Create a group for matchmaking routes
	matchmakingGroup := router.Group("/api/matchmaking")
	{
		// All matchmaking routes require authentication
		matchmakingGroup.Use(authMiddleware.RequireAuth())

		// Join matchmaking queue
		matchmakingGroup.POST("/queue", matchmakingHandler.JoinQueue)

		// Leave matchmaking queue
		matchmakingGroup.DELETE("/queue", matchmakingHandler.LeaveQueue)

		// Get queue status
		matchmakingGroup.GET("/queue/status", matchmakingHandler.GetQueueStatus)

		// Create custom game
		matchmakingGroup.POST("/custom", matchmakingHandler.CreateCustomGame)
	}
}
