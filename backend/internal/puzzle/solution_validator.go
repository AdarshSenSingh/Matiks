package puzzle

import (
	"fmt"
	"math"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/hectoclash/internal/models"
)

// ValidationResult represents the result of a solution validation
type ValidationResult struct {
	IsCorrect      bool
	ExecutionTime  float64 // in milliseconds
	Steps          []ValidationStep
	ErrorMessage   string
	Score          int
	RatingChange   int
	SolutionMetric SolutionMetric
}

// ValidationStep represents a step in the validation process
type ValidationStep struct {
	Description string
	Result      string
	IsSuccess   bool
}

// SolutionMetric contains metrics about the solution
type SolutionMetric struct {
	Length           int     // Length of the solution
	OperatorCount    int     // Number of operators
	ParenthesesCount int     // Number of parentheses
	Complexity       float64 // Calculated complexity
	ExecutionTime    float64 // Time to validate in milliseconds
}

// SolutionValidator validates solutions for Hectoc puzzles
type SolutionValidator struct {
	evaluator      *ExpressionEvaluator
	resultCache    map[string]ValidationResult
	cacheMutex     sync.RWMutex
	cacheMaxSize   int
	cacheExpiry    time.Duration
	cacheTimestamp map[string]time.Time
}

// NewSolutionValidator creates a new solution validator
func NewSolutionValidator() *SolutionValidator {
	return &SolutionValidator{
		evaluator:      NewExpressionEvaluator(),
		resultCache:    make(map[string]ValidationResult),
		cacheMutex:     sync.RWMutex{},
		cacheMaxSize:   1000,
		cacheExpiry:    time.Hour,
		cacheTimestamp: make(map[string]time.Time),
	}
}

// ValidateSolution validates a solution for a puzzle
func (v *SolutionValidator) ValidateSolution(puzzle *models.Puzzle, solution string, playerRating int) ValidationResult {
	// Start timing the validation
	startTime := time.Now()

	// Create a result with default values
	result := ValidationResult{
		IsCorrect:    false,
		Steps:        []ValidationStep{},
		ErrorMessage: "",
	}

	// Check cache first
	cacheKey := fmt.Sprintf("%s:%s", puzzle.ID, solution)
	cachedResult, found := v.getCachedResult(cacheKey)
	if found {
		// Update execution time and return cached result
		cachedResult.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0
		return cachedResult
	}

	// Clean the solution
	cleanedSolution := v.cleanSolution(solution)

	// Step 1: Check if the solution is not empty
	if cleanedSolution == "" {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution is not empty",
			Result:      "Solution is empty",
			IsSuccess:   false,
		})
		result.ErrorMessage = "Solution cannot be empty"
		return result
	}

	// Step 2: Check if the solution uses all digits from the puzzle
	if !v.usesAllDigitsInOrder(puzzle.Sequence, cleanedSolution) {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution uses all digits in the correct order",
			Result:      "Solution does not use all digits in the correct order",
			IsSuccess:   false,
		})
		result.ErrorMessage = "Solution must use all digits from the puzzle in the correct order"
		return result
	} else {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution uses all digits in the correct order",
			Result:      "Solution uses all digits in the correct order",
			IsSuccess:   true,
		})
	}

	// Step 3: Check if the solution is a valid mathematical expression
	expressionValue, err := v.evaluator.Evaluate(cleanedSolution)
	if err != nil {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution is a valid mathematical expression",
			Result:      fmt.Sprintf("Invalid expression: %s", err.Error()),
			IsSuccess:   false,
		})
		result.ErrorMessage = fmt.Sprintf("Invalid mathematical expression: %s", err.Error())
		return result
	} else {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution is a valid mathematical expression",
			Result:      fmt.Sprintf("Valid expression, evaluates to %.0f", expressionValue),
			IsSuccess:   true,
		})
	}

	// Step 4: Check if the solution equals 100
	if expressionValue != 100 {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution equals 100",
			Result:      fmt.Sprintf("Solution evaluates to %.0f, not 100", expressionValue),
			IsSuccess:   false,
		})
		result.ErrorMessage = fmt.Sprintf("Solution must equal 100, got %.0f", expressionValue)
		return result
	} else {
		result.Steps = append(result.Steps, ValidationStep{
			Description: "Check if solution equals 100",
			Result:      "Solution equals 100",
			IsSuccess:   true,
		})
	}

	// Calculate solution metrics
	metric := v.calculateSolutionMetrics(cleanedSolution)
	metric.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0
	result.SolutionMetric = metric

	// Calculate score based on solution metrics and puzzle difficulty
	score := v.calculateScore(metric, puzzle.Difficulty)
	result.Score = score

	// Calculate rating change
	ratingChange := v.calculateRatingChange(playerRating, int(puzzle.Difficulty), metric.ExecutionTime/1000.0) // Convert to seconds
	result.RatingChange = ratingChange

	// Solution is correct
	result.IsCorrect = true
	result.ExecutionTime = float64(time.Since(startTime).Microseconds()) / 1000.0

	// Cache the result
	v.cacheResult(cacheKey, result)

	return result
}

// Helper function to clean a solution
func (v *SolutionValidator) cleanSolution(solution string) string {
	// Remove all whitespace
	solution = strings.ReplaceAll(solution, " ", "")

	// Replace × with * and ÷ with /
	solution = strings.ReplaceAll(solution, "×", "*")
	solution = strings.ReplaceAll(solution, "÷", "/")

	return solution
}

// Helper function to check if a solution uses all digits in the correct order
func (v *SolutionValidator) usesAllDigitsInOrder(sequence, solution string) bool {
	// Extract all digits from the solution
	re := regexp.MustCompile("[^0-9]")
	digits := re.ReplaceAllString(solution, "")

	// Check if the digits match the sequence
	return digits == sequence
}

// Helper function to calculate solution metrics
func (v *SolutionValidator) calculateSolutionMetrics(solution string) SolutionMetric {
	// Count operators
	addSubCount := strings.Count(solution, "+") + strings.Count(solution, "-")
	mulDivCount := strings.Count(solution, "*") + strings.Count(solution, "/")
	parenCount := strings.Count(solution, "(") + strings.Count(solution, ")")

	// Calculate complexity
	// Addition/subtraction: 1 point each
	// Multiplication/division: 1.5 points each
	// Parentheses: 0.5 points each
	complexity := float64(addSubCount) + float64(mulDivCount)*1.5 + float64(parenCount)*0.5

	return SolutionMetric{
		Length:           len(solution),
		OperatorCount:    addSubCount + mulDivCount,
		ParenthesesCount: parenCount,
		Complexity:       complexity,
	}
}

// Helper function to calculate score based on solution metrics and puzzle difficulty
func (v *SolutionValidator) calculateScore(metric SolutionMetric, difficulty models.DifficultyLevel) int {
	// Base score depends on difficulty
	baseScore := int(difficulty) * 100

	// Adjust for solution complexity (more elegant solutions get higher scores)
	complexityFactor := 1.0
	if metric.Complexity < 5 {
		complexityFactor = 1.2 // Bonus for simple solutions
	} else if metric.Complexity > 10 {
		complexityFactor = 0.8 // Penalty for overly complex solutions
	}

	// Adjust for execution time (faster validation = higher score)
	timeFactor := 1.0
	if metric.ExecutionTime < 10 {
		timeFactor = 1.1 // Bonus for fast solutions
	} else if metric.ExecutionTime > 100 {
		timeFactor = 0.9 // Penalty for slow solutions
	}

	// Calculate final score
	score := int(float64(baseScore) * complexityFactor * timeFactor)

	return score
}

// Helper function to calculate rating change
func (v *SolutionValidator) calculateRatingChange(playerRating, puzzleDifficulty int, solveTime float64) int {
	// Convert difficulty to ELO rating
	puzzleRating := 800 + (puzzleDifficulty-1)*400

	// Constants for ELO calculation
	k := 32 // K-factor

	// Calculate expected score
	expectedScore := 1.0 / (1.0 + math.Pow(10, float64(puzzleRating-playerRating)/400.0))

	// Calculate actual score with time bonus
	actualScore := 1.0

	// Add time bonus (faster solve = higher score)
	if solveTime < 10 {
		actualScore += 0.5 // Maximum bonus for very fast solves
	} else if solveTime < 30 {
		actualScore += 0.3 // Good bonus for fast solves
	} else if solveTime < 60 {
		actualScore += 0.1 // Small bonus for decent solves
	}

	// Calculate rating change
	ratingChange := int(math.Round(float64(k) * (actualScore - expectedScore)))

	// Limit the maximum change
	if ratingChange > 50 {
		ratingChange = 50
	} else if ratingChange < -10 {
		ratingChange = -10 // Limit negative change for correct solutions
	}

	return ratingChange
}

// Helper function to get a cached validation result
func (v *SolutionValidator) getCachedResult(key string) (ValidationResult, bool) {
	v.cacheMutex.RLock()
	defer v.cacheMutex.RUnlock()

	result, exists := v.resultCache[key]
	if !exists {
		return ValidationResult{}, false
	}

	// Check if the result has expired
	timestamp, exists := v.cacheTimestamp[key]
	if !exists || time.Since(timestamp) > v.cacheExpiry {
		delete(v.resultCache, key)
		delete(v.cacheTimestamp, key)
		return ValidationResult{}, false
	}

	return result, true
}

// Helper function to cache a validation result
func (v *SolutionValidator) cacheResult(key string, result ValidationResult) {
	v.cacheMutex.Lock()
	defer v.cacheMutex.Unlock()

	// Check if the cache is full
	if len(v.resultCache) >= v.cacheMaxSize {
		// Find the oldest entry
		var oldestKey string
		var oldestTime time.Time

		for k, t := range v.cacheTimestamp {
			if oldestKey == "" || t.Before(oldestTime) {
				oldestKey = k
				oldestTime = t
			}
		}

		// Remove the oldest entry
		if oldestKey != "" {
			delete(v.resultCache, oldestKey)
			delete(v.cacheTimestamp, oldestKey)
		}
	}

	// Add the new entry
	v.resultCache[key] = result
	v.cacheTimestamp[key] = time.Now()
}

// ClearCache clears the validation result cache
func (v *SolutionValidator) ClearCache() {
	v.cacheMutex.Lock()
	defer v.cacheMutex.Unlock()

	v.resultCache = make(map[string]ValidationResult)
	v.cacheTimestamp = make(map[string]time.Time)
}
