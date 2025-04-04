package repository

import (
	"errors"
	"time"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// GameRepository handles database operations for games
type GameRepository struct {
	db *gorm.DB
}

// NewGameRepository creates a new game repository
func NewGameRepository(db *gorm.DB) *GameRepository {
	return &GameRepository{db: db}
}

// Create creates a new game
func (r *GameRepository) Create(game *models.Game) error {
	return r.db.Create(game).Error
}

// FindByID finds a game by ID
func (r *GameRepository) FindByID(id string) (*models.Game, error) {
	var game models.Game
	err := r.db.Preload("Players.User").First(&game, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("game not found")
		}
		return nil, err
	}
	return &game, nil
}

// Update updates a game
func (r *GameRepository) Update(game *models.Game) error {
	return r.db.Save(game).Error
}

// Delete deletes a game
func (r *GameRepository) Delete(id string) error {
	return r.db.Delete(&models.Game{}, "id = ?", id).Error
}

// FindActiveGames finds all active games
func (r *GameRepository) FindActiveGames() ([]models.Game, error) {
	var games []models.Game
	err := r.db.Preload("Players.User").Where("status = ?", models.GameStatusActive).Find(&games).Error
	return games, err
}

// FindGamesByUserID finds all games for a user
func (r *GameRepository) FindGamesByUserID(userID string, limit, offset int) ([]models.Game, error) {
	var games []models.Game
	err := r.db.Preload("Players.User").
		Joins("JOIN players ON players.game_id = games.id").
		Where("players.user_id = ?", userID).
		Order("games.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&games).Error
	return games, err
}

// CountGamesByUserID counts all games for a user
func (r *GameRepository) CountGamesByUserID(userID string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Game{}).
		Joins("JOIN players ON players.game_id = games.id").
		Where("players.user_id = ?", userID).
		Count(&count).Error
	return count, err
}

// FindRecentGames finds recent games with pagination
func (r *GameRepository) FindRecentGames(limit, offset int) ([]models.Game, error) {
	var games []models.Game
	err := r.db.Preload("Players.User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&games).Error
	return games, err
}

// CountGames counts all games
func (r *GameRepository) CountGames() (int64, error) {
	var count int64
	err := r.db.Model(&models.Game{}).Count(&count).Error
	return count, err
}

// FindGamesByStatus finds games by status
func (r *GameRepository) FindGamesByStatus(status models.GameStatus, limit, offset int) ([]models.Game, error) {
	var games []models.Game
	err := r.db.Preload("Players.User").
		Where("status = ?", status).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&games).Error
	return games, err
}

// CountGamesByStatus counts games by status
func (r *GameRepository) CountGamesByStatus(status models.GameStatus) (int64, error) {
	var count int64
	err := r.db.Model(&models.Game{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// FindGamesByDateRange finds games within a date range
func (r *GameRepository) FindGamesByDateRange(startDate, endDate time.Time, limit, offset int) ([]models.Game, error) {
	var games []models.Game
	err := r.db.Preload("Players.User").
		Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&games).Error
	return games, err
}

// CountGamesByDateRange counts games within a date range
func (r *GameRepository) CountGamesByDateRange(startDate, endDate time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.Game{}).Where("created_at BETWEEN ? AND ?", startDate, endDate).Count(&count).Error
	return count, err
}

// AddPlayerToGame adds a player to a game
func (r *GameRepository) AddPlayerToGame(player *models.Player) error {
	return r.db.Create(player).Error
}

// UpdatePlayer updates a player
func (r *GameRepository) UpdatePlayer(player *models.Player) error {
	return r.db.Save(player).Error
}

// FindPlayerByID finds a player by ID
func (r *GameRepository) FindPlayerByID(id string) (*models.Player, error) {
	var player models.Player
	err := r.db.Preload("User").First(&player, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("player not found")
		}
		return nil, err
	}
	return &player, nil
}

// FindPlayerByGameAndUser finds a player by game ID and user ID
func (r *GameRepository) FindPlayerByGameAndUser(gameID, userID string) (*models.Player, error) {
	var player models.Player
	err := r.db.Preload("User").
		Where("game_id = ? AND user_id = ?", gameID, userID).
		First(&player).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("player not found")
		}
		return nil, err
	}
	return &player, nil
}
