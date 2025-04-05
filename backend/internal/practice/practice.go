package practice

import (
	"time"

	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/puzzle"
)

// SessionConfig represents configuration for a practice session
type SessionConfig struct {
	UserID    string `json:"user_id"`
	TimedMode bool   `json:"timed_mode"` // true for timed (60s per question), false for untimed
	StartELO  int    `json:"start_elo"`  // Starting ELO for the session (default: user's current ELO)
}

// Session represents a practice session
type Session struct {
	ID            string                 `json:"id"`
	UserID        string                 `json:"user_id"`
	TimedMode     bool                   `json:"timed_mode"`
	CurrentELO    int                    `json:"current_elo"`
	StartELO      int                    `json:"start_elo"`
	CurrentPuzzle *models.Puzzle         `json:"current_puzzle"`
	GameID        string                 `json:"game_id"`
	StartedAt     time.Time              `json:"started_at"`
	LastUpdatedAt time.Time              `json:"last_updated_at"`
	CompletedAt   *time.Time             `json:"completed_at,omitempty"`
	PuzzlesSolved int                    `json:"puzzles_solved"`
	Status        string                 `json:"status"` // "active", "completed", "failed"
	Metadata      map[string]any `json:"metadata,omitempty"`
}

// Service defines the interface for practice mode operations
type Service interface {
	CreateSession(config SessionConfig) (*Session, error)
	SubmitSolution(session *Session, solution string) (*puzzle.ValidationResult, error)
	EndSession(session *Session) error
}
