package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Handler handles WebSocket connections
type Handler struct {
	hub *Hub
}

// NewHandler creates a new WebSocket handler
func NewHandler(hub *Hub) *Handler {
	return &Handler{
		hub: hub,
	}
}

// HandleConnection handles WebSocket connection requests
func (h *Handler) HandleConnection(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		// If user is not authenticated, generate a guest ID
		userID = "guest-" + uuid.New().String()
	}

	// Generate a client ID
	clientID := uuid.New().String()

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}

	// Create a new client
	client := NewClient(clientID, userID.(string), h.hub, conn)

	// Register client with hub
	h.hub.register <- client

	// Start client goroutines
	go client.WritePump()
	go client.ReadPump()
}

// HandleGameConnection handles WebSocket connection requests for a specific game
func (h *Handler) HandleGameConnection(c *gin.Context) {
	// Get game ID from URL
	gameID := c.Param("id")
	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Game ID is required",
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Authentication required",
		})
		return
	}

	// Generate a client ID
	clientID := uuid.New().String()

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}

	// Create a new client
	client := NewClient(clientID, userID.(string), h.hub, conn)

	// Register client with hub
	h.hub.register <- client

	// Join game room
	client.JoinRoom(gameID)

	// Start client goroutines
	go client.WritePump()
	go client.ReadPump()
}

// HandleReconnection handles WebSocket reconnection requests
func (h *Handler) HandleReconnection(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Authentication required",
		})
		return
	}

	// Generate a client ID
	clientID := uuid.New().String()

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}

	// Create a new client
	client := NewClient(clientID, userID.(string), h.hub, conn)

	// Register client with hub
	h.hub.register <- client

	// Check if user was in any game rooms
	h.hub.mu.Lock()
	for gameID, clients := range h.hub.gameRooms {
		for c := range clients {
			if c.UserID == userID.(string) {
				// User was in this game room, join it again
				h.hub.mu.Unlock()
				client.JoinRoom(gameID)
				h.hub.mu.Lock()
				break
			}
		}
	}
	h.hub.mu.Unlock()

	// Start client goroutines
	go client.WritePump()
	go client.ReadPump()
}
