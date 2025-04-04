package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/handlers"
	"github.com/hectoclash/internal/middleware"
)

// SetupAuthRoutes sets up the authentication routes
func SetupAuthRoutes(router *gin.Engine, authHandler *handlers.AuthHandler, authMiddleware *middleware.AuthMiddleware) {
	// Create a group for auth routes
	authGroup := router.Group("/api/auth")
	{
		// Public routes
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/logout", authHandler.Logout)
		authGroup.POST("/refresh", authHandler.RefreshToken)

		// Protected routes
		authGroup.GET("/me", authMiddleware.RequireAuth(), authHandler.GetCurrentUser)
	}
}
