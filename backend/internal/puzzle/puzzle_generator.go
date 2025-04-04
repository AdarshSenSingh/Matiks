package puzzle

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

// PuzzleGenerator generates Hectoc puzzles
type PuzzleGenerator struct {
	evaluator *ExpressionEvaluator
}

// NewPuzzleGenerator creates a new puzzle generator
func NewPuzzleGenerator() *PuzzleGenerator {
	return &PuzzleGenerator{
		evaluator: NewExpressionEvaluator(),
	}
}

// GenerateSequence generates a random 6-digit sequence
func (g *PuzzleGenerator) GenerateSequence() string {
	// Create a local random generator with a random source
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Generate 6 random digits between 1 and 9
	digits := make([]byte, 6)
	for i := 0; i < 6; i++ {
		digits[i] = byte(rng.Intn(9) + 1 + '0')
	}

	return string(digits)
}

// GenerateSolutions generates all possible solutions for a sequence
func (g *PuzzleGenerator) GenerateSolutions(sequence string) []string {
	// Convert sequence to digits
	digits := make([]int, len(sequence))
	for i, c := range sequence {
		digits[i] = int(c - '0')
	}

	// Generate all possible expressions
	expressions := []string{}
	g.backtrack(digits, 0, "", &expressions)

	// Filter valid solutions (result = 100)
	validSolutions := []string{}
	for _, expr := range expressions {
		result, err := g.evaluator.Evaluate(expr)
		if err == nil && result == 100 {
			validSolutions = append(validSolutions, expr)
		}
	}

	return validSolutions
}

// Backtrack recursively generates all possible expressions
func (g *PuzzleGenerator) backtrack(digits []int, index int, current string, results *[]string) {
	if index == len(digits) {
		// We've used all digits, evaluate the expression
		if current != "" {
			// Only add valid expressions (those that can be evaluated)
			_, err := g.evaluator.Evaluate(current)
			if err == nil {
				*results = append(*results, current)
			}
		}
		return
	}

	// Try using the current digit
	digit := digits[index]
	digitStr := fmt.Sprintf("%d", digit)

	// If this is the first digit, just add it
	if current == "" {
		g.backtrack(digits, index+1, digitStr, results)
		return
	}

	// Try adding the digit with different operators
	operators := []string{"+", "-", "*", "/"}
	for _, op := range operators {
		// Add operator and digit
		g.backtrack(digits, index+1, current+op+digitStr, results)

		// Try with parentheses around the current expression
		g.backtrack(digits, index+1, "("+current+")"+op+digitStr, results)

		// Try with parentheses around the new term
		g.backtrack(digits, index+1, current+op+"("+digitStr, results)

		// Try with closing parenthesis
		if strings.Count(current, "(") > strings.Count(current, ")") {
			g.backtrack(digits, index+1, current+")"+op+digitStr, results)
			g.backtrack(digits, index+1, current+op+digitStr+")", results)
		}

		// Try with opening parenthesis
		g.backtrack(digits, index+1, "("+current+op+digitStr, results)
		g.backtrack(digits, index+1, current+op+"("+digitStr, results)
	}

	// Try with just closing a parenthesis if there are unclosed ones
	if strings.Count(current, "(") > strings.Count(current, ")") {
		g.backtrack(digits, index, current+")", results)
	}

	// Try with just opening a new parenthesis
	g.backtrack(digits, index, current+"(", results)
}

// FindOptimalSolution finds the most elegant solution among all valid solutions
func (g *PuzzleGenerator) FindOptimalSolution(solutions []string) string {
	if len(solutions) == 0 {
		return ""
	}

	// Score each solution based on simplicity
	bestScore := -1
	bestSolution := ""

	for _, solution := range solutions {
		score := g.scoreSolution(solution)
		if bestScore == -1 || score > bestScore {
			bestScore = score
			bestSolution = solution
		}
	}

	return bestSolution
}

// ScoreSolution scores a solution based on simplicity and elegance
func (g *PuzzleGenerator) scoreSolution(solution string) int {
	// Count the number of each type of character
	operators := strings.Count(solution, "+") + strings.Count(solution, "-") +
		strings.Count(solution, "*") + strings.Count(solution, "/")
	parentheses := strings.Count(solution, "(") + strings.Count(solution, ")")

	// Prefer solutions with fewer operators and parentheses
	// This is a simple scoring system; you can make it more sophisticated
	return 100 - (operators*5 + parentheses*3)
}

// CreateExplanation creates a step-by-step explanation of a solution
func (g *PuzzleGenerator) CreateExplanation(solution string) string {
	// This is a simplified version; a real implementation would parse the expression
	// and show the step-by-step evaluation

	// For now, just show the solution and the result
	return fmt.Sprintf("Solution: %s = 100", solution)
}

// GeneratePuzzleWithDifficulty generates a puzzle with a specific difficulty level
func (g *PuzzleGenerator) GeneratePuzzleWithDifficulty(targetDifficulty int) (string, []string, error) {
	maxAttempts := 100
	for attempt := 0; attempt < maxAttempts; attempt++ {
		// Generate a random sequence
		sequence := g.GenerateSequence()

		// Generate solutions
		solutions := g.GenerateSolutions(sequence)

		if len(solutions) == 0 {
			continue // No solutions, try again
		}

		// Calculate difficulty
		difficulty := g.calculateDifficulty(solutions)

		// Check if difficulty matches target
		if difficulty >= targetDifficulty-1 && difficulty <= targetDifficulty+1 {
			return sequence, solutions, nil
		}
	}

	return "", nil, fmt.Errorf("failed to generate puzzle with difficulty %d after %d attempts", targetDifficulty, maxAttempts)
}

// CalculateDifficulty calculates the difficulty of a puzzle based on its solutions
func (g *PuzzleGenerator) calculateDifficulty(solutions []string) int {
	if len(solutions) == 0 {
		return 5 // Maximum difficulty if no solutions
	}

	// Calculate average complexity of solutions
	totalComplexity := 0
	for _, solution := range solutions {
		complexity := g.calculateComplexity(solution)
		totalComplexity += complexity
	}
	avgComplexity := totalComplexity / len(solutions)

	// Adjust based on number of solutions (fewer solutions = more difficult)
	solutionFactor := 5 - len(solutions)
	if solutionFactor < 0 {
		solutionFactor = 0
	}

	// Calculate final difficulty (1-5 scale)
	difficulty := (avgComplexity + solutionFactor) / 2
	if difficulty < 1 {
		difficulty = 1
	} else if difficulty > 5 {
		difficulty = 5
	}

	return difficulty
}

// CalculateComplexity calculates the complexity of a solution
func (g *PuzzleGenerator) calculateComplexity(solution string) int {
	// Count operators and parentheses
	operators := strings.Count(solution, "+") + strings.Count(solution, "-") +
		strings.Count(solution, "*") + strings.Count(solution, "/")
	parentheses := strings.Count(solution, "(") + strings.Count(solution, ")")

	// Calculate complexity (1-5 scale)
	complexity := (operators + parentheses) / 2
	if complexity < 1 {
		complexity = 1
	} else if complexity > 5 {
		complexity = 5
	}

	return complexity
}
