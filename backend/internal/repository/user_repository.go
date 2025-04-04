package repository

import (
	"errors"
	"time"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// UserRepository handles database operations for users
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id string) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "email = ?", email).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

// FindByUsername finds a user by username
func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "username = ?", username).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete deletes a user
func (r *UserRepository) Delete(id string) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

// GetUserStats gets user statistics
func (r *UserRepository) GetUserStats(userID string) (*models.UserStats, error) {
	var stats models.UserStats
	err := r.db.First(&stats, "user_id = ?", userID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new stats if not found
			stats = models.UserStats{
				UserID:        userID,
				GamesPlayed:   0,
				GamesWon:      0,
				CurrentStreak: 0,
				MaxStreak:     0,
				Rating:        1000,
			}
			err = r.db.Create(&stats).Error
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	return &stats, nil
}

// UpdateUserStats updates user statistics
func (r *UserRepository) UpdateUserStats(stats *models.UserStats) error {
	return r.db.Save(stats).Error
}

// GetTopPlayers gets the top players by rating
func (r *UserRepository) GetTopPlayers(limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Order("rating DESC").Limit(limit).Find(&users).Error
	return users, err
}

// SearchUsers searches for users by username or email
func (r *UserRepository) SearchUsers(query string, limit, offset int) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("username LIKE ? OR email LIKE ?", "%"+query+"%", "%"+query+"%").
		Order("username ASC").
		Limit(limit).
		Offset(offset).
		Find(&users).Error
	return users, err
}

// CountUsers counts all users
func (r *UserRepository) CountUsers() (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Count(&count).Error
	return count, err
}

// GetUsersByIDs gets users by IDs
func (r *UserRepository) GetUsersByIDs(ids []string) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("id IN ?", ids).Find(&users).Error
	return users, err
}

// UpdateUserRating updates a user's rating
func (r *UserRepository) UpdateUserRating(userID string, newRating int) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("rating", newRating).Error
}

// GetUserWithStats gets a user with their stats
func (r *UserRepository) GetUserWithStats(userID string) (*models.User, *models.UserStats, error) {
	user, err := r.FindByID(userID)
	if err != nil {
		return nil, nil, err
	}

	stats, err := r.GetUserStats(userID)
	if err != nil {
		return nil, nil, err
	}

	return user, stats, nil
}

// GetActiveUsers gets users who have been active recently
func (r *UserRepository) GetActiveUsers(since time.Time, limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("last_activity > ?", since).
		Order("last_activity DESC").
		Limit(limit).
		Find(&users).Error
	return users, err
}
