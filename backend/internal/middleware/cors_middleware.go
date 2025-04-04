package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/config"
)

// SetupCORS sets up CORS middleware
func SetupCORS(cfg *config.Config) gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     cfg.CORS.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Important for cookies
		MaxAge:           86400, // 24 hours
	})
}
