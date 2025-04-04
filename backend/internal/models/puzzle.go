package models

import (
	"time"
)

// DifficultyLevel represents the difficulty level of a puzzle
type DifficultyLevel int

const (
	DifficultyEasy      DifficultyLevel = 1
	DifficultyMedium    DifficultyLevel = 2
	DifficultyHard      DifficultyLevel = 3
	DifficultyExpert    DifficultyLevel = 4
	DifficultyChampion  DifficultyLevel = 5
)

// Puzzle represents a Hectoc puzzle
type Puzzle struct {
	ID              string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Sequence        string         `json:"sequence" gorm:"not null;uniqueIndex"` // The 6-digit sequence
	Difficulty      DifficultyLevel `json:"difficulty" gorm:"not null"`
	ComplexityScore float64        `json:"complexity_score" gorm:"not null"` // Calculated complexity score
	SolutionCount   int            `json:"solution_count" gorm:"not null"`   // Number of valid solutions
	OptimalSolution string         `json:"optimal_solution" gorm:"not null"` // The most elegant solution
	Explanation     string         `json:"explanation" gorm:"not null"`      // Explanation of the optimal solution
	UsageCount      int            `json:"usage_count" gorm:"default:0"`     // How many times this puzzle has been used
	SuccessRate     float64        `json:"success_rate" gorm:"default:0"`    // Percentage of successful solutions
	AvgSolveTime    float64        `json:"avg_solve_time" gorm:"default:0"`  // Average time to solve in seconds
	MinELO          int            `json:"min_elo" gorm:"default:0"`         // Minimum ELO rating recommended for this puzzle
	MaxELO          int            `json:"max_elo" gorm:"default:3000"`      // Maximum ELO rating recommended for this puzzle
	CreatedAt       time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
}

// PuzzleSolution represents a solution to a puzzle
type PuzzleSolution struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	PuzzleID     string    `json:"puzzle_id" gorm:"type:uuid;not null;index"`
	Puzzle       Puzzle    `json:"-" gorm:"foreignKey:PuzzleID"`
	Expression   string    `json:"expression" gorm:"not null"`
	Complexity   float64   `json:"complexity" gorm:"not null"` // Calculated complexity score
	IsOptimal    bool      `json:"is_optimal" gorm:"default:false"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// PuzzleResponse is the response structure for puzzle data
type PuzzleResponse struct {
	ID              string         `json:"id"`
	Sequence        string         `json:"sequence"`
	Difficulty      DifficultyLevel `json:"difficulty"`
	ComplexityScore float64        `json:"complexity_score"`
	SolutionCount   int            `json:"solution_count"`
	OptimalSolution string         `json:"optimal_solution,omitempty"` // Only included in certain contexts
	Explanation     string         `json:"explanation,omitempty"`      // Only included in certain contexts
	SuccessRate     float64        `json:"success_rate"`
	AvgSolveTime    float64        `json:"avg_solve_time"`
}

// ToResponse converts a Puzzle to a PuzzleResponse
func (p *Puzzle) ToResponse(includeSolution bool) PuzzleResponse {
	response := PuzzleResponse{
		ID:              p.ID,
		Sequence:        p.Sequence,
		Difficulty:      p.Difficulty,
		ComplexityScore: p.ComplexityScore,
		SolutionCount:   p.SolutionCount,
		SuccessRate:     p.SuccessRate,
		AvgSolveTime:    p.AvgSolveTime,
	}

	if includeSolution {
		response.OptimalSolution = p.OptimalSolution
		response.Explanation = p.Explanation
	}

	return response
}

// PuzzleSolutionResponse is the response structure for puzzle solution data
type PuzzleSolutionResponse struct {
	ID         string  `json:"id"`
	PuzzleID   string  `json:"puzzle_id"`
	Expression string  `json:"expression"`
	Complexity float64 `json:"complexity"`
	IsOptimal  bool    `json:"is_optimal"`
}

// ToResponse converts a PuzzleSolution to a PuzzleSolutionResponse
func (ps *PuzzleSolution) ToResponse() PuzzleSolutionResponse {
	return PuzzleSolutionResponse{
		ID:         ps.ID,
		PuzzleID:   ps.PuzzleID,
		Expression: ps.Expression,
		Complexity: ps.Complexity,
		IsOptimal:  ps.IsOptimal,
	}
}
