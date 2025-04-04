package repository

import (
	"log"

	"github.com/hectoclash/internal/config"
	"github.com/hectoclash/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Database represents a database connection
type Database struct {
	DB *gorm.DB
}

// NewDatabase creates a new database connection
func NewDatabase(cfg *config.Config) (*Database, error) {
	// Set up GORM logger
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to the database
	db, err := gorm.Open(postgres.Open(cfg.Database.URL), gormConfig)
	if err != nil {
		return nil, err
	}

	// Auto migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.UserStats{},
		&models.Game{},
		&models.Player{},
		&models.LeaderboardEntry{},
		&models.Achievement{},
		&models.UserAchievement{},
		&models.Friendship{},
		&models.Puzzle{},
		&models.PuzzleSolution{},
	)
	if err != nil {
		return nil, err
	}

	// Create database indexes
	err = CreateIndexes(db)
	if err != nil {
		return nil, err
	}

	log.Println("Database connected and migrated successfully")

	return &Database{DB: db}, nil
}

// Close closes the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
