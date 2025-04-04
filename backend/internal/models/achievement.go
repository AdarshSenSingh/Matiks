package models

import (
	"time"
)

// AchievementType represents the type of achievement
type AchievementType string

const (
	AchievementTypeGames     AchievementType = "games"     // Based on number of games played
	AchievementTypeWins      AchievementType = "wins"      // Based on number of wins
	AchievementTypeStreak    AchievementType = "streak"    // Based on streak
	AchievementTypeSpeed     AchievementType = "speed"     // Based on solve time
	AchievementTypeAccuracy  AchievementType = "accuracy"  // Based on solution accuracy
	AchievementTypeDifficulty AchievementType = "difficulty" // Based on puzzle difficulty
)

// Achievement represents an achievement definition
type Achievement struct {
	ID          string          `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string          `json:"name" gorm:"not null;uniqueIndex"`
	Description string          `json:"description" gorm:"not null"`
	Type        AchievementType `json:"type" gorm:"type:varchar(20);not null;index"`
	Threshold   int             `json:"threshold" gorm:"not null"` // Value needed to unlock
	IconURL     string          `json:"icon_url" gorm:"not null"`
	CreatedAt   time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time       `json:"updated_at" gorm:"autoUpdateTime"`
}

// UserAchievement represents an achievement earned by a user
type UserAchievement struct {
	ID            string      `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID        string      `json:"user_id" gorm:"type:uuid;not null;index"`
	User          User        `json:"-" gorm:"foreignKey:UserID"`
	AchievementID string      `json:"achievement_id" gorm:"type:uuid;not null"`
	Achievement   Achievement `json:"-" gorm:"foreignKey:AchievementID"`
	UnlockedAt    time.Time   `json:"unlocked_at" gorm:"not null"`
	Progress      int         `json:"progress" gorm:"not null;default:0"` // Current progress towards threshold
	IsComplete    bool        `json:"is_complete" gorm:"not null;default:false"`
	CreatedAt     time.Time   `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time   `json:"updated_at" gorm:"autoUpdateTime"`
}

// AchievementResponse is the response structure for achievement data
type AchievementResponse struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Type        AchievementType `json:"type"`
	Threshold   int             `json:"threshold"`
	IconURL     string          `json:"icon_url"`
}

// UserAchievementResponse is the response structure for user achievement data
type UserAchievementResponse struct {
	ID          string             `json:"id"`
	UserID      string             `json:"user_id"`
	Achievement AchievementResponse `json:"achievement"`
	UnlockedAt  time.Time          `json:"unlocked_at"`
	Progress    int                `json:"progress"`
	IsComplete  bool               `json:"is_complete"`
}

// ToResponse converts an Achievement to an AchievementResponse
func (a *Achievement) ToResponse() AchievementResponse {
	return AchievementResponse{
		ID:          a.ID,
		Name:        a.Name,
		Description: a.Description,
		Type:        a.Type,
		Threshold:   a.Threshold,
		IconURL:     a.IconURL,
	}
}

// ToResponse converts a UserAchievement to a UserAchievementResponse
func (ua *UserAchievement) ToResponse() UserAchievementResponse {
	return UserAchievementResponse{
		ID:          ua.ID,
		UserID:      ua.UserID,
		Achievement: ua.Achievement.ToResponse(),
		UnlockedAt:  ua.UnlockedAt,
		Progress:    ua.Progress,
		IsComplete:  ua.IsComplete,
	}
}
