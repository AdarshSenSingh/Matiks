package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/game"
)

// GameHandler handles game-related requests
type GameHandler struct {
	gameService *game.Service
}

// NewGameHandler creates a new game handler
func NewGameHandler(gameService *game.Service) *GameHandler {
	return &GameHandler{
		gameService: gameService,
	}
}

// CreateGame creates a new game
func (h *GameHandler) CreateGame(c *gin.Context) {
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

	// Create game
	game, err := h.gameService.CreateGame(userID.(string), input.GameType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create game",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    game,
	})
}

// GetGame gets a game by ID
func (h *GameHandler) GetGame(c *gin.Context) {
	// Get game ID from URL
	gameID := c.Param("id")
	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Game ID is required",
		})
		return
	}

	// Get game
	game, err := h.gameService.GetGame(gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Game not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    game,
	})
}

// GetActiveGames gets all active games
func (h *GameHandler) GetActiveGames(c *gin.Context) {
	// Get active games
	games, err := h.gameService.GetActiveGames()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get active games",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    games,
	})
}

// JoinGame adds a player to a game
func (h *GameHandler) JoinGame(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Get game ID from URL
	gameID := c.Param("id")
	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Game ID is required",
		})
		return
	}

	// Join game
	err := h.gameService.JoinGame(gameID, userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Get updated game
	game, err := h.gameService.GetGame(gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get updated game",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    game,
	})
}

// SubmitSolution submits a solution for a game
func (h *GameHandler) SubmitSolution(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Get game ID from URL
	gameID := c.Param("id")
	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Game ID is required",
		})
		return
	}

	// Parse solution from request
	var input struct {
		Solution string `json:"solution" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid input",
		})
		return
	}

	// Submit solution
	err := h.gameService.SubmitSolution(gameID, userID.(string), input.Solution)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Get updated game
	game, err := h.gameService.GetGame(gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get updated game",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    game,
	})
}