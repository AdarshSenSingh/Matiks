package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/puzzle"
	"github.com/hectoclash/internal/repository"
)

// PuzzleHandler handles puzzle-related requests
type PuzzleHandler struct {
	puzzleService *puzzle.Service
	puzzleRepo    *repository.PuzzleRepository
	userRepo      *repository.UserRepository
}

// NewPuzzleHandler creates a new puzzle handler
func NewPuzzleHandler(puzzleService *puzzle.Service, puzzleRepo *repository.PuzzleRepository, userRepo *repository.UserRepository) *PuzzleHandler {
	return &PuzzleHandler{
		puzzleService: puzzleService,
		puzzleRepo:    puzzleRepo,
		userRepo:      userRepo,
	}
}

// GetPuzzle gets a puzzle by ID
func (h *PuzzleHandler) GetPuzzle(c *gin.Context) {
	id := c.Param("id")

	// Get the puzzle
	puzzle, err := h.puzzleRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Puzzle not found",
		})
		return
	}

	// Check if solution should be included
	includeSolution := false
	if c.Query("include_solution") == "true" {
		// Only include solution if the user is authenticated
		_, exists := c.Get("userID")
		if exists {
			// In a real implementation, you might want to check if the user has already solved the puzzle
			includeSolution = true
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    puzzle.ToResponse(includeSolution),
	})
}

// GetPuzzleForUser gets a puzzle suitable for a user's ELO rating
func (h *PuzzleHandler) GetPuzzleForUser(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Get user's ELO rating
	user, err := h.userRepo.FindByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get user",
		})
		return
	}

	// Get a puzzle suitable for the user's ELO rating
	puzzle, err := h.puzzleService.GetPuzzleForUser(user.Rating)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get puzzle",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    puzzle.ToResponse(false),
	})
}

// GetPuzzlesByDifficulty gets puzzles by difficulty level
func (h *PuzzleHandler) GetPuzzlesByDifficulty(c *gin.Context) {
	// Parse difficulty
	difficultyStr := c.Param("difficulty")
	difficulty, err := strconv.Atoi(difficultyStr)
	if err != nil || difficulty < 1 || difficulty > 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid difficulty level",
		})
		return
	}

	// Parse pagination parameters
	limit, offset := getPaginationParams(c)

	// Get puzzles
	puzzles, err := h.puzzleService.GetPuzzlesByDifficulty(models.DifficultyLevel(difficulty), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get puzzles",
		})
		return
	}

	// Convert to response format
	response := make([]models.PuzzleResponse, len(puzzles))
	for i, p := range puzzles {
		response[i] = p.ToResponse(false)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
		"meta": gin.H{
			"difficulty": difficulty,
			"count":      len(puzzles),
			"limit":      limit,
			"offset":     offset,
		},
	})
}

// ValidateSolution validates a solution for a puzzle
func (h *PuzzleHandler) ValidateSolution(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Solution string `json:"solution" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	// Validate the solution
	isCorrect, err := h.puzzleService.ValidateSolution(id, input.Solution)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to validate solution",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"is_correct": isCorrect,
		},
	})
}

// GeneratePuzzle generates a new puzzle
func (h *PuzzleHandler) GeneratePuzzle(c *gin.Context) {
	// Check if a specific difficulty was requested
	difficultyStr := c.Query("difficulty")
	if difficultyStr != "" {
		difficulty, err := strconv.Atoi(difficultyStr)
		if err == nil && difficulty >= 1 && difficulty <= 5 {
			// Generate a puzzle with the requested difficulty
			generator := puzzle.NewPuzzleGenerator()
			sequence, solutions, err := generator.GeneratePuzzleWithDifficulty(difficulty)
			if err == nil && len(solutions) > 0 {
				// Find the optimal solution
				optimalSolution := generator.FindOptimalSolution(solutions)

				// Create a puzzle object
				puzzle := &models.Puzzle{
					Sequence:        sequence,
					Difficulty:      models.DifficultyLevel(difficulty),
					SolutionCount:   len(solutions),
					OptimalSolution: optimalSolution,
					Explanation:     generator.CreateExplanation(optimalSolution),
				}

				// Save the puzzle
				err = h.puzzleRepo.Create(puzzle)
				if err == nil {
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"data":    puzzle.ToResponse(false),
					})
					return
				}
			}
		}
	}

	// If we couldn't generate a puzzle with the requested difficulty or no difficulty was specified,
	// generate a random puzzle
	puzzle, err := h.puzzleService.GeneratePuzzle()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate puzzle",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    puzzle.ToResponse(false),
	})
}

// Helper function to get pagination parameters
func getPaginationParams(c *gin.Context) (int, int) {
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	return limit, offset
}
