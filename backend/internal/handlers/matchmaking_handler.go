package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/matchmaking"
)

// MatchmakingHandler handles matchmaking-related requests
type MatchmakingHandler struct {
	matchmakingService *matchmaking.Service
}

// NewMatchmakingHandler creates a new matchmaking handler
func NewMatchmakingHandler(matchmakingService *matchmaking.Service) *MatchmakingHandler {
	return &MatchmakingHandler{
		matchmakingService: matchmakingService,
	}
}

// JoinQueue adds a player to the matchmaking queue
func (h *MatchmakingHandler) JoinQueue(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Parse game type from request
	var input struct {
		GameType string `json:"game_type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid input",
		})
		return
	}

	// Join queue
	err := h.matchmakingService.JoinQueue(userID.(string), input.GameType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Joined matchmaking queue",
	})
}

// LeaveQueue removes a player from the matchmaking queue
func (h *MatchmakingHandler) LeaveQueue(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Leave queue
	err := h.matchmakingService.LeaveQueue(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Left matchmaking queue",
	})
}

// GetQueueStatus gets the status of a player in the matchmaking queue
func (h *MatchmakingHandler) GetQueueStatus(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Get queue status
	inQueue, waitTime, err := h.matchmakingService.GetQueueStatus(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"in_queue":  inQueue,
			"wait_time": waitTime.Seconds(),
		},
	})
}

// CreateCustomGame creates a custom game with the specified players
func (h *MatchmakingHandler) CreateCustomGame(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Parse request
	var input struct {
		OpponentIDs []string `json:"opponent_ids" binding:"required"`
		GameType    string   `json:"game_type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid input",
		})
		return
	}

	// Create custom game
	game, err := h.matchmakingService.CreateCustomGame(userID.(string), input.OpponentIDs, input.GameType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    game,
	})
}
