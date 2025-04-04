package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/middleware"
	"github.com/hectoclash/internal/websocket"
)

// RegisterWebSocketRoutes registers WebSocket routes
func RegisterWebSocketRoutes(router *gin.Engine, wsHandler *websocket.Handler, authMiddleware *middleware.AuthMiddleware) {
	// WebSocket routes
	ws := router.Group("/ws")
	{
		// Public WebSocket connection
		ws.GET("/connect", wsHandler.HandleConnection)

		// Authenticated WebSocket connection
		ws.GET("/auth", authMiddleware.RequireAuth(), wsHandler.HandleConnection)

		// Game WebSocket connection
		ws.GET("/game/:id", authMiddleware.RequireAuth(), wsHandler.HandleGameConnection)

		// Reconnection endpoint
		ws.GET("/reconnect", authMiddleware.RequireAuth(), wsHandler.HandleReconnection)
	}
}
