package models

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID           string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Username     string     `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Email        string     `json:"email" gorm:"uniqueIndex;size:100;not null"`
	Password     string     `json:"-" gorm:"not null"` // Password hash, not exposed in JSON
	Rating       int        `json:"rating" gorm:"default:1000"`
	Streak       int        `json:"streak" gorm:"default:0"`
	LastLogin    time.Time  `json:"last_login"`
	LastActivity time.Time  `json:"last_activity"`
	CreatedAt    time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt    *time.Time `json:"-" gorm:"index"`
}

// UserStats represents statistics for a user
type UserStats struct {
	ID            string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID        string    `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	User          User      `json:"-" gorm:"foreignKey:UserID"`
	GamesPlayed   int       `json:"games_played" gorm:"default:0"`
	GamesWon      int       `json:"games_won" gorm:"default:0"`
	AvgSolveTime  float64   `json:"avg_solve_time" gorm:"default:0"` // in seconds
	Rating        int       `json:"rating" gorm:"default:1000"`
	CurrentStreak int       `json:"current_streak" gorm:"default:0"`
	MaxStreak     int       `json:"max_streak" gorm:"default:0"`
	LastGameDate  time.Time `json:"last_game_date"`
	CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// BeforeSave is a GORM hook that hashes the password before saving
func (u *User) BeforeSave(tx *gorm.DB) error {
	// Only hash the password if it has been changed and is not already hashed
	if u.Password != "" && !isPasswordHashed(u.Password) {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

// isPasswordHashed checks if a password is already hashed
func isPasswordHashed(password string) bool {
	// bcrypt hashes start with $2a$, $2b$, or $2y$
	return len(password) == 60 && (password[0:4] == "$2a$" || password[0:4] == "$2b$" || password[0:4] == "$2y$")
}

// ComparePassword checks if the provided password matches the stored hash
func (u *User) ComparePassword(password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	if err != nil {
		return errors.New("invalid password")
	}
	return nil
}

// UserResponse is the response structure for user data
type UserResponse struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	Rating       int       `json:"rating"`
	Streak       int       `json:"streak"`
	LastLogin    time.Time `json:"last_login"`
	LastActivity time.Time `json:"last_activity"`
	CreatedAt    time.Time `json:"created_at"`
}

// ToResponse converts a User to a UserResponse
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:           u.ID,
		Username:     u.Username,
		Email:        u.Email,
		Rating:       u.Rating,
		Streak:       u.Streak,
		LastLogin:    u.LastLogin,
		LastActivity: u.LastActivity,
		CreatedAt:    u.CreatedAt,
	}
}

// UpdateStreak updates the user's streak based on game activity
func (s *UserStats) UpdateStreak(gameDate time.Time) {
	// If this is the first game or it's been more than 48 hours since the last game, reset streak
	if s.LastGameDate.IsZero() || gameDate.Sub(s.LastGameDate) > 48*time.Hour {
		s.CurrentStreak = 1
	} else if gameDate.Day() != s.LastGameDate.Day() {
		// If it's a different day but within 48 hours, increment streak
		s.CurrentStreak++
	}

	// Update max streak if current streak is higher
	if s.CurrentStreak > s.MaxStreak {
		s.MaxStreak = s.CurrentStreak
	}

	// Update last game date
	s.LastGameDate = gameDate
}
