package models

import (
	"database/sql/driver"
	"errors"
	"time"
)

// GameStatus represents the status of a game
type GameStatus string

const (
	GameStatusWaiting   GameStatus = "waiting"
	GameStatusActive    GameStatus = "active"
	GameStatusCompleted GameStatus = "completed"
	GameStatusAbandoned GameStatus = "abandoned"
)

// Value implements the driver.Valuer interface for GameStatus
func (gs GameStatus) Value() (driver.Value, error) {
	return string(gs), nil
}

// Scan implements the sql.Scanner interface for GameStatus
func (gs *GameStatus) Scan(value any) error {
	if value == nil {
		return errors.New("GameStatus cannot be null")
	}
	if sv, err := driver.String.ConvertValue(value); err == nil {
		if v, ok := sv.(string); ok {
			*gs = GameStatus(v)
			return nil
		}
	}
	return errors.New("failed to scan GameStatus")
}

// Game represents a Hectoc game
type Game struct {
	ID             string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	PuzzleSequence string     `json:"puzzle_sequence" gorm:"not null"` // The 6-digit sequence
	Status         GameStatus `json:"status" gorm:"type:varchar(20);not null;default:'waiting'"`
	GameType       string     `json:"game_type" gorm:"type:varchar(20);not null;default:'duel'"` // duel, practice, tournament
	Difficulty     int        `json:"difficulty" gorm:"default:1"` // 1-5 difficulty rating
	WinnerID       *string    `json:"winner_id,omitempty" gorm:"type:uuid;null"`
	Winner         *User      `json:"-" gorm:"foreignKey:WinnerID"`
	CreatedAt      time.Time  `json:"created_at" gorm:"autoCreateTime"`
	StartedAt      *time.Time `json:"started_at,omitempty" gorm:"null"`
	CompletedAt    *time.Time `json:"completed_at,omitempty" gorm:"null"`
	Duration       *float64   `json:"duration,omitempty" gorm:"null"` // in seconds
	UpdatedAt      time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	Players        []Player   `json:"players" gorm:"foreignKey:GameID"`
}

// Player represents a player in a game
type Player struct {
	ID                string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	GameID            string     `json:"game_id" gorm:"type:uuid;not null"`
	Game              Game       `json:"-" gorm:"foreignKey:GameID"`
	UserID            string     `json:"user_id" gorm:"type:uuid;not null"`
	User              User       `json:"-" gorm:"foreignKey:UserID"`
	SolutionSubmitted *string    `json:"solution_submitted,omitempty" gorm:"null"`
	SolutionTime      *float64   `json:"solution_time,omitempty" gorm:"null"` // in seconds
	IsCorrect         *bool      `json:"is_correct,omitempty" gorm:"null"`
	Score             *int       `json:"score,omitempty" gorm:"null"` // Points earned in this game
	RatingChange      *int       `json:"rating_change,omitempty" gorm:"null"` // Change in rating after game
	Attempts          int        `json:"attempts" gorm:"default:0"` // Number of solution attempts
	JoinedAt          time.Time  `json:"joined_at" gorm:"autoCreateTime"`
	FinishedAt        *time.Time `json:"finished_at,omitempty" gorm:"null"` // When player finished the puzzle
	UpdatedAt         time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

// Solution represents a solution to a Hectoc puzzle
type Solution struct {
	Expression string `json:"expression"`
	IsCorrect  bool   `json:"is_correct"`
}

// GameResponse is the response structure for game data
type GameResponse struct {
	ID             string           `json:"id"`
	PuzzleSequence string           `json:"puzzle_sequence"`
	Status         GameStatus       `json:"status"`
	GameType       string           `json:"game_type"`
	Difficulty     int              `json:"difficulty"`
	WinnerID       *string          `json:"winner_id,omitempty"`
	CreatedAt      time.Time        `json:"created_at"`
	StartedAt      *time.Time       `json:"started_at,omitempty"`
	CompletedAt    *time.Time       `json:"completed_at,omitempty"`
	Duration       *float64         `json:"duration,omitempty"`
	Players        []PlayerResponse `json:"players"`
}

// PlayerResponse is the response structure for player data
type PlayerResponse struct {
	ID                string     `json:"id"`
	UserID            string     `json:"user_id"`
	Username          string     `json:"username"`
	SolutionSubmitted *string    `json:"solution_submitted,omitempty"`
	SolutionTime      *float64   `json:"solution_time,omitempty"`
	IsCorrect         *bool      `json:"is_correct,omitempty"`
	Score             *int       `json:"score,omitempty"`
	RatingChange      *int       `json:"rating_change,omitempty"`
	Attempts          int        `json:"attempts"`
	JoinedAt          time.Time  `json:"joined_at"`
	FinishedAt        *time.Time `json:"finished_at,omitempty"`
	Progress          *float64   `json:"progress,omitempty"`
}

// ToResponse converts a Game to a GameResponse
func (g *Game) ToResponse() GameResponse {
	response := GameResponse{
		ID:             g.ID,
		PuzzleSequence: g.PuzzleSequence,
		Status:         g.Status,
		GameType:       g.GameType,
		Difficulty:     g.Difficulty,
		WinnerID:       g.WinnerID,
		CreatedAt:      g.CreatedAt,
		StartedAt:      g.StartedAt,
		CompletedAt:    g.CompletedAt,
		Duration:       g.Duration,
		Players:        make([]PlayerResponse, len(g.Players)),
	}

	for i, player := range g.Players {
		response.Players[i] = player.ToResponse()
	}

	return response
}

// ToResponse converts a Player to a PlayerResponse
func (p *Player) ToResponse() PlayerResponse {
	response := PlayerResponse{
		ID:                p.ID,
		UserID:            p.UserID,
		Username:          p.User.Username,
		SolutionSubmitted: p.SolutionSubmitted,
		SolutionTime:      p.SolutionTime,
		IsCorrect:         p.IsCorrect,
		Score:             p.Score,
		RatingChange:      p.RatingChange,
		Attempts:          p.Attempts,
		JoinedAt:          p.JoinedAt,
		FinishedAt:        p.FinishedAt,
	}

	return response
}
