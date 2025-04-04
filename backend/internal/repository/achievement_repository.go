package repository

import (
	"errors"
	"time"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// AchievementRepository handles database operations for achievements
type AchievementRepository struct {
	db *gorm.DB
}

// NewAchievementRepository creates a new achievement repository
func NewAchievementRepository(db *gorm.DB) *AchievementRepository {
	return &AchievementRepository{db: db}
}

// CreateAchievement creates a new achievement
func (r *AchievementRepository) CreateAchievement(achievement *models.Achievement) error {
	return r.db.Create(achievement).Error
}

// UpdateAchievement updates an achievement
func (r *AchievementRepository) UpdateAchievement(achievement *models.Achievement) error {
	return r.db.Save(achievement).Error
}

// DeleteAchievement deletes an achievement
func (r *AchievementRepository) DeleteAchievement(id string) error {
	return r.db.Delete(&models.Achievement{}, "id = ?", id).Error
}

// FindAchievementByID finds an achievement by ID
func (r *AchievementRepository) FindAchievementByID(id string) (*models.Achievement, error) {
	var achievement models.Achievement
	err := r.db.First(&achievement, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("achievement not found")
		}
		return nil, err
	}
	return &achievement, nil
}

// FindAchievementByName finds an achievement by name
func (r *AchievementRepository) FindAchievementByName(name string) (*models.Achievement, error) {
	var achievement models.Achievement
	err := r.db.Where("name = ?", name).First(&achievement).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("achievement not found")
		}
		return nil, err
	}
	return &achievement, nil
}

// GetAllAchievements gets all achievements
func (r *AchievementRepository) GetAllAchievements() ([]models.Achievement, error) {
	var achievements []models.Achievement
	err := r.db.Find(&achievements).Error
	return achievements, err
}

// GetAchievementsByType gets achievements by type
func (r *AchievementRepository) GetAchievementsByType(achievementType models.AchievementType) ([]models.Achievement, error) {
	var achievements []models.Achievement
	err := r.db.Where("type = ?", achievementType).Find(&achievements).Error
	return achievements, err
}

// CreateUserAchievement creates a new user achievement
func (r *AchievementRepository) CreateUserAchievement(userAchievement *models.UserAchievement) error {
	return r.db.Create(userAchievement).Error
}

// UpdateUserAchievement updates a user achievement
func (r *AchievementRepository) UpdateUserAchievement(userAchievement *models.UserAchievement) error {
	return r.db.Save(userAchievement).Error
}

// FindUserAchievementByID finds a user achievement by ID
func (r *AchievementRepository) FindUserAchievementByID(id string) (*models.UserAchievement, error) {
	var userAchievement models.UserAchievement
	err := r.db.Preload("Achievement").Preload("User").First(&userAchievement, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user achievement not found")
		}
		return nil, err
	}
	return &userAchievement, nil
}

// FindUserAchievementByUserAndAchievement finds a user achievement by user ID and achievement ID
func (r *AchievementRepository) FindUserAchievementByUserAndAchievement(userID, achievementID string) (*models.UserAchievement, error) {
	var userAchievement models.UserAchievement
	err := r.db.Preload("Achievement").Preload("User").
		Where("user_id = ? AND achievement_id = ?", userID, achievementID).
		First(&userAchievement).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user achievement not found")
		}
		return nil, err
	}
	return &userAchievement, nil
}

// GetUserAchievements gets all achievements for a user
func (r *AchievementRepository) GetUserAchievements(userID string) ([]models.UserAchievement, error) {
	var userAchievements []models.UserAchievement
	err := r.db.Preload("Achievement").Preload("User").
		Where("user_id = ?", userID).
		Find(&userAchievements).Error
	return userAchievements, err
}

// GetCompletedUserAchievements gets all completed achievements for a user
func (r *AchievementRepository) GetCompletedUserAchievements(userID string) ([]models.UserAchievement, error) {
	var userAchievements []models.UserAchievement
	err := r.db.Preload("Achievement").Preload("User").
		Where("user_id = ? AND is_complete = ?", userID, true).
		Find(&userAchievements).Error
	return userAchievements, err
}

// GetInProgressUserAchievements gets all in-progress achievements for a user
func (r *AchievementRepository) GetInProgressUserAchievements(userID string) ([]models.UserAchievement, error) {
	var userAchievements []models.UserAchievement
	err := r.db.Preload("Achievement").Preload("User").
		Where("user_id = ? AND is_complete = ?", userID, false).
		Find(&userAchievements).Error
	return userAchievements, err
}

// GetRecentlyUnlockedAchievements gets recently unlocked achievements for a user
func (r *AchievementRepository) GetRecentlyUnlockedAchievements(userID string, limit int) ([]models.UserAchievement, error) {
	var userAchievements []models.UserAchievement
	err := r.db.Preload("Achievement").Preload("User").
		Where("user_id = ? AND is_complete = ?", userID, true).
		Order("unlocked_at DESC").
		Limit(limit).
		Find(&userAchievements).Error
	return userAchievements, err
}

// InitializeUserAchievements initializes achievements for a new user
func (r *AchievementRepository) InitializeUserAchievements(userID string) error {
	// Get all achievements
	var achievements []models.Achievement
	if err := r.db.Find(&achievements).Error; err != nil {
		return err
	}

	// Create user achievements with 0 progress
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, achievement := range achievements {
			userAchievement := models.UserAchievement{
				UserID:        userID,
				AchievementID: achievement.ID,
				Progress:      0,
				IsComplete:    false,
				UnlockedAt:    time.Now(), // This will be updated when completed
			}
			if err := tx.Create(&userAchievement).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// UpdateAchievementProgress updates the progress of a user achievement
func (r *AchievementRepository) UpdateAchievementProgress(userID, achievementID string, progress int) error {
	// Find the user achievement
	userAchievement, err := r.FindUserAchievementByUserAndAchievement(userID, achievementID)
	if err != nil {
		return err
	}

	// Find the achievement to get the threshold
	achievement, err := r.FindAchievementByID(achievementID)
	if err != nil {
		return err
	}

	// Update progress
	userAchievement.Progress = progress

	// Check if the achievement is now complete
	if progress >= achievement.Threshold && !userAchievement.IsComplete {
		userAchievement.IsComplete = true
		userAchievement.UnlockedAt = time.Now()
	}

	// Save the changes
	return r.db.Save(userAchievement).Error
}

// CheckAndUpdateAchievements checks and updates achievements for a user based on their stats
func (r *AchievementRepository) CheckAndUpdateAchievements(userID string) error {
	// Get user stats
	var userStats models.UserStats
	if err := r.db.Where("user_id = ?", userID).First(&userStats).Error; err != nil {
		return err
	}

	// Get all achievements
	achievements, err := r.GetAllAchievements()
	if err != nil {
		return err
	}

	// Check each achievement
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, achievement := range achievements {
			var progress int

			// Determine progress based on achievement type
			switch achievement.Type {
			case models.AchievementTypeGames:
				progress = userStats.GamesPlayed
			case models.AchievementTypeWins:
				progress = userStats.GamesWon
			case models.AchievementTypeStreak:
				progress = userStats.CurrentStreak
			// Add other achievement types as needed
			default:
				continue
			}

			// Update the achievement progress
			userAchievement, err := r.FindUserAchievementByUserAndAchievement(userID, achievement.ID)
			if err != nil {
				// If the user achievement doesn't exist, create it
				if err.Error() == "user achievement not found" {
					userAchievement = &models.UserAchievement{
						UserID:        userID,
						AchievementID: achievement.ID,
						Progress:      progress,
						IsComplete:    progress >= achievement.Threshold,
						UnlockedAt:    time.Now(),
					}
					if err := tx.Create(userAchievement).Error; err != nil {
						return err
					}
				} else {
					return err
				}
			} else {
				// Update existing user achievement
				userAchievement.Progress = progress
				if progress >= achievement.Threshold && !userAchievement.IsComplete {
					userAchievement.IsComplete = true
					userAchievement.UnlockedAt = time.Now()
				}
				if err := tx.Save(userAchievement).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}
