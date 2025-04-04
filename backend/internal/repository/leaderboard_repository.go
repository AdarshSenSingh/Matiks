package repository

import (
	"errors"
	"time"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// LeaderboardRepository handles database operations for leaderboards
type LeaderboardRepository struct {
	db *gorm.DB
}

// NewLeaderboardRepository creates a new leaderboard repository
func NewLeaderboardRepository(db *gorm.DB) *LeaderboardRepository {
	return &LeaderboardRepository{db: db}
}

// Create creates a new leaderboard entry
func (r *LeaderboardRepository) Create(entry *models.LeaderboardEntry) error {
	return r.db.Create(entry).Error
}

// Update updates a leaderboard entry
func (r *LeaderboardRepository) Update(entry *models.LeaderboardEntry) error {
	return r.db.Save(entry).Error
}

// Delete deletes a leaderboard entry
func (r *LeaderboardRepository) Delete(id string) error {
	return r.db.Delete(&models.LeaderboardEntry{}, "id = ?", id).Error
}

// FindByID finds a leaderboard entry by ID
func (r *LeaderboardRepository) FindByID(id string) (*models.LeaderboardEntry, error) {
	var entry models.LeaderboardEntry
	err := r.db.Preload("User").First(&entry, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("leaderboard entry not found")
		}
		return nil, err
	}
	return &entry, nil
}

// FindByUserAndType finds a leaderboard entry by user ID and type
func (r *LeaderboardRepository) FindByUserAndType(userID string, leaderboardType models.LeaderboardType) (*models.LeaderboardEntry, error) {
	var entry models.LeaderboardEntry
	err := r.db.Preload("User").
		Where("user_id = ? AND type = ?", userID, leaderboardType).
		First(&entry).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("leaderboard entry not found")
		}
		return nil, err
	}
	return &entry, nil
}

// GetGlobalLeaderboard gets the global leaderboard
func (r *LeaderboardRepository) GetGlobalLeaderboard(limit, offset int) ([]models.LeaderboardEntry, error) {
	var entries []models.LeaderboardEntry
	err := r.db.Preload("User").
		Where("type = ?", models.LeaderboardTypeGlobal).
		Order("rank ASC").
		Limit(limit).
		Offset(offset).
		Find(&entries).Error
	return entries, err
}

// GetWeeklyLeaderboard gets the weekly leaderboard
func (r *LeaderboardRepository) GetWeeklyLeaderboard(limit, offset int) ([]models.LeaderboardEntry, error) {
	var entries []models.LeaderboardEntry
	err := r.db.Preload("User").
		Where("type = ?", models.LeaderboardTypeWeekly).
		Order("rank ASC").
		Limit(limit).
		Offset(offset).
		Find(&entries).Error
	return entries, err
}

// GetMonthlyLeaderboard gets the monthly leaderboard
func (r *LeaderboardRepository) GetMonthlyLeaderboard(limit, offset int) ([]models.LeaderboardEntry, error) {
	var entries []models.LeaderboardEntry
	err := r.db.Preload("User").
		Where("type = ?", models.LeaderboardTypeMonthly).
		Order("rank ASC").
		Limit(limit).
		Offset(offset).
		Find(&entries).Error
	return entries, err
}

// GetFriendsLeaderboard gets the friends leaderboard for a user
func (r *LeaderboardRepository) GetFriendsLeaderboard(userID string, limit, offset int) ([]models.LeaderboardEntry, error) {
	var entries []models.LeaderboardEntry
	err := r.db.Preload("User").
		Joins("JOIN friendships ON friendships.friend_id = leaderboard_entries.user_id").
		Where("friendships.user_id = ? AND friendships.status = ? AND leaderboard_entries.type = ?",
			userID, models.FriendshipStatusAccepted, models.LeaderboardTypeGlobal).
		Order("leaderboard_entries.rank ASC").
		Limit(limit).
		Offset(offset).
		Find(&entries).Error
	return entries, err
}

// GetUserRank gets a user's rank in a specific leaderboard type
func (r *LeaderboardRepository) GetUserRank(userID string, leaderboardType models.LeaderboardType) (int, error) {
	var entry models.LeaderboardEntry
	err := r.db.Select("rank").
		Where("user_id = ? AND type = ?", userID, leaderboardType).
		First(&entry).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, errors.New("user not found in leaderboard")
		}
		return 0, err
	}
	return entry.Rank, nil
}

// UpdateLeaderboardRankings updates the rankings for a specific leaderboard type
func (r *LeaderboardRepository) UpdateLeaderboardRankings(leaderboardType models.LeaderboardType) error {
	// This is a complex operation that would typically involve a transaction
	// and potentially raw SQL for efficiency
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Get all entries for this leaderboard type, ordered by score
		var entries []models.LeaderboardEntry
		if err := tx.Where("type = ?", leaderboardType).
			Order("score DESC").
			Find(&entries).Error; err != nil {
			return err
		}

		// Update ranks
		for i, entry := range entries {
			entry.Rank = i + 1
			if err := tx.Save(&entry).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GenerateWeeklyLeaderboard generates a new weekly leaderboard
func (r *LeaderboardRepository) GenerateWeeklyLeaderboard() error {
	// Calculate the start and end of the current week
	now := time.Now()
	year, week := now.ISOWeek()
	startOfWeek := startOfISOWeek(year, week, now.Location())
	endOfWeek := startOfWeek.AddDate(0, 0, 7).Add(-time.Second)

	return r.generateLeaderboard(models.LeaderboardTypeWeekly, startOfWeek, endOfWeek)
}

// GenerateMonthlyLeaderboard generates a new monthly leaderboard
func (r *LeaderboardRepository) GenerateMonthlyLeaderboard() error {
	// Calculate the start and end of the current month
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)

	return r.generateLeaderboard(models.LeaderboardTypeMonthly, startOfMonth, endOfMonth)
}

// Helper function to generate a leaderboard
func (r *LeaderboardRepository) generateLeaderboard(leaderboardType models.LeaderboardType, startDate, endDate time.Time) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete existing entries for this period
		if err := tx.Where("type = ? AND period_start = ? AND period_end = ?",
			leaderboardType, startDate, endDate).
			Delete(&models.LeaderboardEntry{}).Error; err != nil {
			return err
		}

		// Get user stats for the period
		var userStats []struct {
			UserID       string
			GamesPlayed  int
			GamesWon     int
			AvgSolveTime float64
			Rating       int
			Score        int
		}

		// This query would need to be customized based on your specific scoring logic
		query := `
			SELECT 
				players.user_id,
				COUNT(DISTINCT games.id) as games_played,
				COUNT(DISTINCT CASE WHEN games.winner_id = players.user_id THEN games.id END) as games_won,
				AVG(CASE WHEN players.solution_time IS NOT NULL THEN players.solution_time ELSE 0 END) as avg_solve_time,
				MAX(users.rating) as rating,
				SUM(COALESCE(players.score, 0)) as score
			FROM 
				players
			JOIN 
				games ON players.game_id = games.id
			JOIN 
				users ON players.user_id = users.id
			WHERE 
				games.created_at BETWEEN ? AND ?
			GROUP BY 
				players.user_id
			ORDER BY 
				score DESC
		`

		if err := tx.Raw(query, startDate, endDate).Scan(&userStats).Error; err != nil {
			return err
		}

		// Create leaderboard entries
		for i, stat := range userStats {
			winRate := 0.0
			if stat.GamesPlayed > 0 {
				winRate = float64(stat.GamesWon) / float64(stat.GamesPlayed) * 100
			}

			entry := models.LeaderboardEntry{
				UserID:       stat.UserID,
				Type:         leaderboardType,
				Rank:         i + 1,
				Score:        stat.Score,
				GamesPlayed:  stat.GamesPlayed,
				GamesWon:     stat.GamesWon,
				WinRate:      winRate,
				AvgSolveTime: stat.AvgSolveTime,
				Rating:       stat.Rating,
				PeriodStart:  startDate,
				PeriodEnd:    endDate,
			}

			if err := tx.Create(&entry).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// Helper function to get the start of an ISO week
func startOfISOWeek(year, week int, loc *time.Location) time.Time {
	// Find the first day of the year
	date := time.Date(year, 1, 1, 0, 0, 0, 0, loc)
	
	// Get the weekday of the first day
	weekday := int(date.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday is 7 in ISO
	}
	
	// Find the first Monday
	daysToFirstMonday := 1 - weekday
	if daysToFirstMonday <= -7 {
		daysToFirstMonday += 7
	}
	
	firstMonday := date.AddDate(0, 0, daysToFirstMonday)
	
	// Add the weeks
	return firstMonday.AddDate(0, 0, (week-1)*7)
}
