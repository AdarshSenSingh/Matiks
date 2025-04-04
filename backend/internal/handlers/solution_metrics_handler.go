package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/repository"
)

// SolutionMetricsHandler handles solution metrics-related requests
type SolutionMetricsHandler struct {
	metricsRepo *repository.SolutionMetricsRepository
}

// NewSolutionMetricsHandler creates a new solution metrics handler
func NewSolutionMetricsHandler(metricsRepo *repository.SolutionMetricsRepository) *SolutionMetricsHandler {
	return &SolutionMetricsHandler{
		metricsRepo: metricsRepo,
	}
}

// GetUserMetrics gets solution metrics for a user
func (h *SolutionMetricsHandler) GetUserMetrics(c *gin.Context) {
	userID := c.Param("id")
	
	// Parse pagination parameters
	limit, offset := getPaginationParams(c)
	
	// Get metrics
	metrics, err := h.metricsRepo.FindByUser(userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get metrics",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetPuzzleMetrics gets solution metrics for a puzzle
func (h *SolutionMetricsHandler) GetPuzzleMetrics(c *gin.Context) {
	puzzleID := c.Param("id")
	
	// Parse pagination parameters
	limit, offset := getPaginationParams(c)
	
	// Get metrics
	metrics, err := h.metricsRepo.FindByPuzzle(puzzleID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get metrics",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetUserAverageMetrics gets average metrics for a user
func (h *SolutionMetricsHandler) GetUserAverageMetrics(c *gin.Context) {
	userID := c.Param("id")
	
	// Get average metrics
	metrics, err := h.metricsRepo.GetUserAverageMetrics(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get average metrics",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetPuzzleAverageMetrics gets average metrics for a puzzle
func (h *SolutionMetricsHandler) GetPuzzleAverageMetrics(c *gin.Context) {
	puzzleID := c.Param("id")
	
	// Get average metrics
	metrics, err := h.metricsRepo.GetPuzzleAverageMetrics(puzzleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get average metrics",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetUserAndPuzzleMetrics gets metrics for a specific user and puzzle
func (h *SolutionMetricsHandler) GetUserAndPuzzleMetrics(c *gin.Context) {
	userID := c.Param("user_id")
	puzzleID := c.Param("puzzle_id")
	
	// Get metrics
	metrics, err := h.metricsRepo.FindByUserAndPuzzle(userID, puzzleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get metrics",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}
