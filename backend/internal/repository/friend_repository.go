package repository

import (
	"errors"
	"time"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// FriendRepository handles database operations for friendships
type FriendRepository struct {
	db *gorm.DB
}

// NewFriendRepository creates a new friend repository
func NewFriendRepository(db *gorm.DB) *FriendRepository {
	return &FriendRepository{db: db}
}

// CreateFriendship creates a new friendship
func (r *FriendRepository) CreateFriendship(friendship *models.Friendship) error {
	return r.db.Create(friendship).Error
}

// UpdateFriendship updates a friendship
func (r *FriendRepository) UpdateFriendship(friendship *models.Friendship) error {
	return r.db.Save(friendship).Error
}

// DeleteFriendship deletes a friendship
func (r *FriendRepository) DeleteFriendship(id string) error {
	return r.db.Delete(&models.Friendship{}, "id = ?", id).Error
}

// FindFriendshipByID finds a friendship by ID
func (r *FriendRepository) FindFriendshipByID(id string) (*models.Friendship, error) {
	var friendship models.Friendship
	err := r.db.Preload("User").Preload("Friend").First(&friendship, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("friendship not found")
		}
		return nil, err
	}
	return &friendship, nil
}

// FindFriendshipByUsers finds a friendship between two users
func (r *FriendRepository) FindFriendshipByUsers(userID, friendID string) (*models.Friendship, error) {
	var friendship models.Friendship
	err := r.db.Preload("User").Preload("Friend").
		Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
			userID, friendID, friendID, userID).
		First(&friendship).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("friendship not found")
		}
		return nil, err
	}
	return &friendship, nil
}

// GetFriendships gets all friendships for a user
func (r *FriendRepository) GetFriendships(userID string) ([]models.Friendship, error) {
	var friendships []models.Friendship
	err := r.db.Preload("User").Preload("Friend").
		Where("user_id = ? OR friend_id = ?", userID, userID).
		Find(&friendships).Error
	return friendships, err
}

// GetFriends gets all friends for a user (accepted friendships only)
func (r *FriendRepository) GetFriends(userID string) ([]models.Friendship, error) {
	var friendships []models.Friendship
	err := r.db.Preload("User").Preload("Friend").
		Where("(user_id = ? OR friend_id = ?) AND status = ?",
			userID, userID, models.FriendshipStatusAccepted).
		Find(&friendships).Error
	return friendships, err
}

// GetPendingFriendRequests gets all pending friend requests for a user
func (r *FriendRepository) GetPendingFriendRequests(userID string) ([]models.Friendship, error) {
	var friendships []models.Friendship
	err := r.db.Preload("User").Preload("Friend").
		Where("friend_id = ? AND status = ?", userID, models.FriendshipStatusPending).
		Find(&friendships).Error
	return friendships, err
}

// GetSentFriendRequests gets all sent friend requests by a user
func (r *FriendRepository) GetSentFriendRequests(userID string) ([]models.Friendship, error) {
	var friendships []models.Friendship
	err := r.db.Preload("User").Preload("Friend").
		Where("user_id = ? AND status = ?", userID, models.FriendshipStatusPending).
		Find(&friendships).Error
	return friendships, err
}

// AcceptFriendRequest accepts a friend request
func (r *FriendRepository) AcceptFriendRequest(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Find the friendship
		var friendship models.Friendship
		if err := tx.First(&friendship, "id = ?", id).Error; err != nil {
			return err
		}

		// Check if the friendship is pending
		if friendship.Status != models.FriendshipStatusPending {
			return errors.New("friendship is not pending")
		}

		// Update the friendship
		friendship.Status = models.FriendshipStatusAccepted
		now := time.Now()
		friendship.AcceptedAt = &now
		return tx.Save(&friendship).Error
	})
}

// RejectFriendRequest rejects a friend request
func (r *FriendRepository) RejectFriendRequest(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Find the friendship
		var friendship models.Friendship
		if err := tx.First(&friendship, "id = ?", id).Error; err != nil {
			return err
		}

		// Check if the friendship is pending
		if friendship.Status != models.FriendshipStatusPending {
			return errors.New("friendship is not pending")
		}

		// Update the friendship
		friendship.Status = models.FriendshipStatusRejected
		return tx.Save(&friendship).Error
	})
}

// BlockUser blocks a user
func (r *FriendRepository) BlockUser(userID, blockedUserID string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Check if there's an existing friendship
		friendship, err := r.FindFriendshipByUsers(userID, blockedUserID)
		if err != nil && err.Error() != "friendship not found" {
			return err
		}

		if err != nil && err.Error() == "friendship not found" {
			// Create a new friendship with blocked status
			friendship = &models.Friendship{
				UserID:   userID,
				FriendID: blockedUserID,
				Status:   models.FriendshipStatusBlocked,
			}
			return tx.Create(friendship).Error
		}

		// Update the existing friendship
		friendship.Status = models.FriendshipStatusBlocked
		// Make sure the user who is blocking is the one who initiated the block
		if friendship.UserID != userID {
			// Swap user and friend
			friendship.UserID, friendship.FriendID = friendship.FriendID, friendship.UserID
		}
		return tx.Save(friendship).Error
	})
}

// UnblockUser unblocks a user
func (r *FriendRepository) UnblockUser(userID, blockedUserID string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Find the friendship
		var friendship models.Friendship
		err := tx.Where("user_id = ? AND friend_id = ? AND status = ?",
			userID, blockedUserID, models.FriendshipStatusBlocked).
			First(&friendship).Error
		if err != nil {
			return err
		}

		// Delete the friendship
		return tx.Delete(&friendship).Error
	})
}

// GetBlockedUsers gets all users blocked by a user
func (r *FriendRepository) GetBlockedUsers(userID string) ([]models.Friendship, error) {
	var friendships []models.Friendship
	err := r.db.Preload("User").Preload("Friend").
		Where("user_id = ? AND status = ?", userID, models.FriendshipStatusBlocked).
		Find(&friendships).Error
	return friendships, err
}

// IsFriend checks if two users are friends
func (r *FriendRepository) IsFriend(userID1, userID2 string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Friendship{}).
		Where("((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?",
			userID1, userID2, userID2, userID1, models.FriendshipStatusAccepted).
		Count(&count).Error
	return count > 0, err
}

// IsBlocked checks if a user is blocked by another user
func (r *FriendRepository) IsBlocked(userID, blockedByID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Friendship{}).
		Where("user_id = ? AND friend_id = ? AND status = ?",
			blockedByID, userID, models.FriendshipStatusBlocked).
		Count(&count).Error
	return count > 0, err
}
