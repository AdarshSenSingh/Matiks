package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
}

// ServerConfig holds all server related configuration
type ServerConfig struct {
	Port string
	Env  string
}

// DatabaseConfig holds all database related configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	URL      string
}

// JWTConfig holds all JWT related configuration
type JWTConfig struct {
	Secret        string
	RefreshSecret string
	ExpiresIn     time.Duration
	RefreshExpiry time.Duration
}

// CORSConfig holds all CORS related configuration
type CORSConfig struct {
	AllowedOrigins []string
}

// Load loads the configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			Name:     getEnv("DB_NAME", "hectoclash"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret:        getEnv("JWT_SECRET", "your_jwt_secret_key_here"),
			RefreshSecret: getEnv("JWT_REFRESH_SECRET", "your_jwt_refresh_secret_key_here"),
			ExpiresIn:     time.Duration(getEnvAsInt("JWT_EXPIRES_IN", 3600)) * time.Second,
			RefreshExpiry: time.Duration(getEnvAsInt("JWT_REFRESH_EXPIRES_IN", 604800)) * time.Second,
		},
		CORS: CORSConfig{
			AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173"), ","),
		},
	}

	// Build the database URL
	config.Database.URL = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Database.Host,
		config.Database.Port,
		config.Database.User,
		config.Database.Password,
		config.Database.Name,
		config.Database.SSLMode,
	)

	return config
}

// Helper function to get an environment variable or a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// Helper function to get an environment variable as an integer
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
