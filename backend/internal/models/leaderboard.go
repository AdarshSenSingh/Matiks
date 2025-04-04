package models

import (
	"time"
)

// LeaderboardType represents the type of leaderboard
type LeaderboardType string

const (
	LeaderboardTypeGlobal  LeaderboardType = "global"
	LeaderboardTypeWeekly  LeaderboardType = "weekly"
	LeaderboardTypeMonthly LeaderboardType = "monthly"
	LeaderboardTypeFriends LeaderboardType = "friends"
)

// LeaderboardEntry represents an entry in the leaderboard
type LeaderboardEntry struct {
	ID            string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID        string         `json:"user_id" gorm:"type:uuid;not null;index"`
	User          User           `json:"-" gorm:"foreignKey:UserID"`
	Type          LeaderboardType `json:"type" gorm:"type:varchar(20);not null;index"`
	Rank          int            `json:"rank" gorm:"not null"`
	Score         int            `json:"score" gorm:"not null"`
	GamesPlayed   int            `json:"games_played" gorm:"not null"`
	GamesWon      int            `json:"games_won" gorm:"not null"`
	WinRate       float64        `json:"win_rate" gorm:"not null"`
	AvgSolveTime  float64        `json:"avg_solve_time" gorm:"not null"` // in seconds
	Rating        int            `json:"rating" gorm:"not null"`
	PeriodStart   time.Time      `json:"period_start" gorm:"not null;index"`
	PeriodEnd     time.Time      `json:"period_end" gorm:"not null;index"`
	CreatedAt     time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
}

// LeaderboardEntryResponse is the response structure for leaderboard entry data
type LeaderboardEntryResponse struct {
	Rank         int       `json:"rank"`
	UserID       string    `json:"user_id"`
	Username     string    `json:"username"`
	Score        int       `json:"score"`
	GamesPlayed  int       `json:"games_played"`
	GamesWon     int       `json:"games_won"`
	WinRate      float64   `json:"win_rate"`
	AvgSolveTime float64   `json:"avg_solve_time"`
	Rating       int       `json:"rating"`
	PeriodStart  time.Time `json:"period_start"`
	PeriodEnd    time.Time `json:"period_end"`
}

// ToResponse converts a LeaderboardEntry to a LeaderboardEntryResponse
func (le *LeaderboardEntry) ToResponse() LeaderboardEntryResponse {
	return LeaderboardEntryResponse{
		Rank:         le.Rank,
		UserID:       le.UserID,
		Username:     le.User.Username,
		Score:        le.Score,
		GamesPlayed:  le.GamesPlayed,
		GamesWon:     le.GamesWon,
		WinRate:      le.WinRate,
		AvgSolveTime: le.AvgSolveTime,
		Rating:       le.Rating,
		PeriodStart:  le.PeriodStart,
		PeriodEnd:    le.PeriodEnd,
	}
}

// LeaderboardResponse is the response structure for leaderboard data
type LeaderboardResponse struct {
	Type    LeaderboardType           `json:"type"`
	Entries []LeaderboardEntryResponse `json:"entries"`
}