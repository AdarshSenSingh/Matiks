package models

import (
	"database/sql/driver"
	"errors"
	"time"
)

// FriendshipStatus represents the status of a friendship
type FriendshipStatus string

const (
	FriendshipStatusPending  FriendshipStatus = "pending"
	FriendshipStatusAccepted FriendshipStatus = "accepted"
	FriendshipStatusRejected FriendshipStatus = "rejected"
	FriendshipStatusBlocked  FriendshipStatus = "blocked"
)

// Value implements the driver.Valuer interface for FriendshipStatus
func (fs FriendshipStatus) Value() (driver.Value, error) {
	return string(fs), nil
}

// Scan implements the sql.Scanner interface for FriendshipStatus
func (fs *FriendshipStatus) Scan(value any) error {
	if value == nil {
		return errors.New("FriendshipStatus cannot be null")
	}
	if sv, err := driver.String.ConvertValue(value); err == nil {
		if v, ok := sv.(string); ok {
			*fs = FriendshipStatus(v)
			return nil
		}
	}
	return errors.New("failed to scan FriendshipStatus")
}

// Friendship represents a friendship between two users
type Friendship struct {
	ID         string           `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID     string           `json:"user_id" gorm:"type:uuid;not null;index"`
	User       User             `json:"-" gorm:"foreignKey:UserID"`
	FriendID   string           `json:"friend_id" gorm:"type:uuid;not null;index"`
	Friend     User             `json:"-" gorm:"foreignKey:FriendID"`
	Status     FriendshipStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	CreatedAt  time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time        `json:"updated_at" gorm:"autoUpdateTime"`
	AcceptedAt *time.Time       `json:"accepted_at,omitempty" gorm:"null"`
}

// FriendshipResponse is the response structure for friendship data
type FriendshipResponse struct {
	ID         string           `json:"id"`
	UserID     string           `json:"user_id"`
	FriendID   string           `json:"friend_id"`
	FriendName string           `json:"friend_name"`
	Status     FriendshipStatus `json:"status"`
	CreatedAt  time.Time        `json:"created_at"`
	AcceptedAt *time.Time       `json:"accepted_at,omitempty"`
}

// ToResponse converts a Friendship to a FriendshipResponse
func (f *Friendship) ToResponse() FriendshipResponse {
	return FriendshipResponse{
		ID:         f.ID,
		UserID:     f.UserID,
		FriendID:   f.FriendID,
		FriendName: f.Friend.Username,
		Status:     f.Status,
		CreatedAt:  f.CreatedAt,
		AcceptedAt: f.AcceptedAt,
	}
}
