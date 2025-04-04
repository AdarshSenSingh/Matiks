package repository

import (
	"log"

	"gorm.io/gorm"
)

// CreateIndexes creates database indexes for better performance
func CreateIndexes(db *gorm.DB) error {
	log.Println("Creating database indexes...")

	// User indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_rating ON users (rating)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users (last_activity)").Error; err != nil {
		return err
	}

	// Game indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_games_status ON games (status)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_games_created_at ON games (created_at)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_games_started_at ON games (started_at)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_games_completed_at ON games (completed_at)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_games_game_type ON games (game_type)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_games_difficulty ON games (difficulty)").Error; err != nil {
		return err
	}

	// Player indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_players_game_id ON players (game_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_players_user_id ON players (user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_players_is_correct ON players (is_correct)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_players_solution_time ON players (solution_time)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_players_score ON players (score)").Error; err != nil {
		return err
	}

	// UserStats indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats (user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_stats_rating ON user_stats (rating)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_stats_games_played ON user_stats (games_played)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_stats_games_won ON user_stats (games_won)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON user_stats (current_streak)").Error; err != nil {
		return err
	}

	// Leaderboard indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries (user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type ON leaderboard_entries (type)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries (rank)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries (score)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_period_start ON leaderboard_entries (period_start)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_period_end ON leaderboard_entries (period_end)").Error; err != nil {
		return err
	}

	// Achievement indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements (type)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements (user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements (achievement_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_achievements_is_complete ON user_achievements (is_complete)").Error; err != nil {
		return err
	}

	// Friendship indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships (user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships (friend_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships (status)").Error; err != nil {
		return err
	}

	// Puzzle indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzles_sequence ON puzzles (sequence)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON puzzles (difficulty)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzles_min_elo ON puzzles (min_elo)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzles_max_elo ON puzzles (max_elo)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzles_complexity_score ON puzzles (complexity_score)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzle_solutions_puzzle_id ON puzzle_solutions (puzzle_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzle_solutions_is_optimal ON puzzle_solutions (is_optimal)").Error; err != nil {
		return err
	}

	// Composite indexes for common queries
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_friendships_user_friend_status ON friendships (user_id, friend_id, status)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_players_game_user ON players (game_id, user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_rank ON leaderboard_entries (type, rank)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_achievements_user_complete ON user_achievements (user_id, is_complete)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_puzzles_min_max_elo ON puzzles (min_elo, max_elo)").Error; err != nil {
		return err
	}

	log.Println("Database indexes created successfully")
	return nil
}
