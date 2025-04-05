package matchmaking

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/hectoclash/internal/game"
	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/repository"
	"github.com/hectoclash/internal/websocket"
)

const (
	// Queue keys
	queueKey           = "matchmaking:queue"
	queueTimeoutKey    = "matchmaking:queue:timeout"
	queueLockKey       = "matchmaking:queue:lock:%s" // Now includes user ID
	userQueueKey       = "matchmaking:user:%s"
	userGameKey        = "matchmaking:user:%s:game"
	matchmakingTimeout = 60 * time.Second
	lockTimeout        = 5 * time.Second

	// ELO matching parameters
	initialEloRange    = 100
	maxEloRange        = 500
	eloRangeIncrement  = 50
	eloRangeIncrementInterval = 5 * time.Second
)

// Service handles matchmaking functionality
type Service struct {
	redisClient    *redis.Client
	userRepo       *repository.UserRepository
	gameService    *game.Service
	matchProcessor *MatchProcessor
	websocketHub   *websocket.Hub
	mu             sync.Mutex
	isRunning      bool
	stopCh         chan struct{}
}

// QueueEntry represents a player in the matchmaking queue
type QueueEntry struct {
	UserID    string    `json:"user_id"`
	Rating    int       `json:"rating"`
	JoinedAt  time.Time `json:"joined_at"`
	GameType  string    `json:"game_type"`
	Timeout   time.Time `json:"timeout"`
}

// NewService creates a new matchmaking service
func NewService(redisClient *redis.Client, userRepo *repository.UserRepository, gameService *game.Service, websocketHub *websocket.Hub) *Service {
	service := &Service{
		redisClient:  redisClient,
		userRepo:     userRepo,
		gameService:  gameService,
		websocketHub: websocketHub,
		stopCh:       make(chan struct{}),
	}

	service.matchProcessor = NewMatchProcessor(service)

	return service
}

// Start starts the matchmaking service
func (s *Service) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.isRunning {
		return
	}

	s.isRunning = true
	go s.matchProcessor.Start()
	go s.cleanupExpiredEntries()

	log.Println("Matchmaking service started")
}

// Stop stops the matchmaking service
func (s *Service) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isRunning {
		return
	}

	close(s.stopCh)
	s.isRunning = false

	log.Println("Matchmaking service stopped")
}

// JoinQueue adds a player to the matchmaking queue
func (s *Service) JoinQueue(userID, gameType string, ranked bool) error {
	ctx := context.Background()

	// Check if user is already in queue
	userKey := fmt.Sprintf(userQueueKey, userID)
	exists, err := s.redisClient.Exists(ctx, userKey).Result()
	if err != nil {
		return fmt.Errorf("failed to check if user is in queue: %w", err)
	}

	if exists > 0 {
		return errors.New("user is already in matchmaking queue")
	}

	// Get user's rating
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Calculate timeout
	timeout := time.Now().Add(matchmakingTimeout)

	// Acquire lock with user-specific key
	userLockKey := fmt.Sprintf(queueLockKey, userID)
	lockSuccess, err := s.redisClient.SetNX(ctx, userLockKey, "1", lockTimeout).Result()
	if err != nil {
		return fmt.Errorf("failed to acquire lock: %w", err)
	}

	if !lockSuccess {
		// If we can't acquire the lock, the user might already be in the process of joining
		// Let's check if they're already in the queue
		exists, err := s.redisClient.Exists(ctx, userKey).Result()
		if err == nil && exists > 0 {
			// User is already in queue, return success
			return nil
		}
		return errors.New("failed to acquire lock for queue operation")
	}

	defer s.redisClient.Del(ctx, userLockKey)

	// Add to queue
	err = s.redisClient.ZAdd(ctx, queueKey, &redis.Z{
		Score:  float64(user.Rating),
		Member: userID,
	}).Err()
	if err != nil {
		return fmt.Errorf("failed to add user to queue: %w", err)
	}

	// Store user queue data
	userData := map[string]any{
		"game_type": gameType,
		"ranked":    ranked,
	}

	// Convert to JSON
	userDataJSON, err := json.Marshal(userData)
	if err != nil {
		// Cleanup if we can't marshal the data
		s.redisClient.ZRem(ctx, queueKey, userID)
		return fmt.Errorf("failed to marshal user data: %w", err)
	}

	// Store user queue data
	err = s.redisClient.Set(ctx, userKey, string(userDataJSON), matchmakingTimeout).Err()
	if err != nil {
		// Cleanup if we can't store the data
		s.redisClient.ZRem(ctx, queueKey, userID)
		return fmt.Errorf("failed to store user queue data: %w", err)
	}

	// Store timeout
	err = s.redisClient.ZAdd(ctx, queueTimeoutKey, &redis.Z{
		Score:  float64(timeout.Unix()),
		Member: userID,
	}).Err()
	if err != nil {
		// Cleanup if we can't store the timeout
		s.redisClient.ZRem(ctx, queueKey, userID)
		s.redisClient.Del(ctx, userKey)
		return fmt.Errorf("failed to store queue timeout: %w", err)
	}

	log.Printf("User %s joined matchmaking queue with rating %d", userID, user.Rating)

	// Trigger match processing
	go s.matchProcessor.ProcessMatches()

	return nil
}

// LeaveQueue removes a player from the matchmaking queue
func (s *Service) LeaveQueue(userID string) error {
	ctx := context.Background()

	// Check if user is in queue
	userKey := fmt.Sprintf(userQueueKey, userID)
	exists, err := s.redisClient.Exists(ctx, userKey).Result()
	if err != nil {
		return fmt.Errorf("failed to check if user is in queue: %w", err)
	}

	if exists == 0 {
		return errors.New("user is not in matchmaking queue")
	}

	// Acquire lock with user-specific key
	userLockKey := fmt.Sprintf(queueLockKey, userID)
	lockSuccess, err := s.redisClient.SetNX(ctx, userLockKey, "1", lockTimeout).Result()
	if err != nil {
		return fmt.Errorf("failed to acquire lock: %w", err)
	}

	if !lockSuccess {
		// If we can't acquire the lock, the user might already be in the process of leaving
		// Let's check if they're still in the queue
		exists, err := s.redisClient.Exists(ctx, userKey).Result()
		if err == nil && exists == 0 {
			// User is already gone from queue, return success
			return nil
		}
		return errors.New("failed to acquire lock for queue operation")
	}

	defer s.redisClient.Del(ctx, userLockKey)

	// Remove from queue
	err = s.redisClient.ZRem(ctx, queueKey, userID).Err()
	if err != nil {
		return fmt.Errorf("failed to remove user from queue: %w", err)
	}

	// Remove timeout
	err = s.redisClient.ZRem(ctx, queueTimeoutKey, userID).Err()
	if err != nil {
		return fmt.Errorf("failed to remove queue timeout: %w", err)
	}

	// Remove user queue data
	err = s.redisClient.Del(ctx, userKey).Err()
	if err != nil {
		return fmt.Errorf("failed to remove user queue data: %w", err)
	}

	log.Printf("User %s left matchmaking queue", userID)

	return nil
}

// GetQueueStatus gets the status of a player in the matchmaking queue
func (s *Service) GetQueueStatus(userID string) (bool, time.Duration, string, error) {
	ctx := context.Background()

	// Check if user is in queue
	userKey := fmt.Sprintf(userQueueKey, userID)
	exists, err := s.redisClient.Exists(ctx, userKey).Result()
	if err != nil {
		// Log the error but don't fail the request
		log.Printf("Error checking if user %s is in queue: %v", userID, err)
		return false, 0, "", nil
	}

	if exists == 0 {
		return false, 0, "", nil
	}

	// Check if user is in a game
	gameKey := fmt.Sprintf(userGameKey, userID)
	gameID, err := s.redisClient.Get(ctx, gameKey).Result()
	if err != nil && err != redis.Nil {
		return false, 0, "", fmt.Errorf("failed to check if user is in a game: %w", err)
	}

	// If user is in a game, return the game ID
	if err == nil && gameID != "" {
		return true, 0, gameID, nil
	}

	// Check if user is in the queue
	_, err = s.redisClient.ZRank(ctx, queueKey, userID).Result()
	if err != nil {
		if err == redis.Nil {
			return false, 0, "", nil
		}
		return false, 0, "", fmt.Errorf("failed to get user's position in queue: %w", err)
	}

	// Get user's join time
	score, err := s.redisClient.ZScore(ctx, queueTimeoutKey, userID).Result()
	if err != nil {
		if err == redis.Nil {
			return false, 0, "", nil
		}
		return false, 0, "", fmt.Errorf("failed to get user's join time: %w", err)
	}

	timeout := time.Unix(int64(score), 0)
	waitTime := time.Until(timeout)

	return true, waitTime, "", nil
}

// GetQueueLength gets the number of players in the matchmaking queue
func (s *Service) GetQueueLength() (int64, error) {
	ctx := context.Background()

	count, err := s.redisClient.ZCard(ctx, queueKey).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get queue length: %w", err)
	}

	return count, nil
}

// cleanupExpiredEntries removes expired entries from the queue
func (s *Service) cleanupExpiredEntries() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			ctx := context.Background()
			now := time.Now().Unix()

			// Get expired entries
			expiredEntries, err := s.redisClient.ZRangeByScore(ctx, queueTimeoutKey, &redis.ZRangeBy{
				Min: "0",
				Max: fmt.Sprintf("%d", now),
			}).Result()

			if err != nil {
				log.Printf("Failed to get expired entries: %v", err)
				continue
			}

			if len(expiredEntries) == 0 {
				continue
			}

			// Acquire lock
			lockSuccess, err := s.redisClient.SetNX(ctx, queueLockKey, "1", lockTimeout).Result()
			if err != nil {
				log.Printf("Error acquiring lock for cleanup: %v", err)
				continue
			}

			if !lockSuccess {
				// This is normal - another instance might have the lock
				// No need to log this as an error
				continue
			}

			// Remove expired entries
			for _, userID := range expiredEntries {
				// Remove from queue
				s.redisClient.ZRem(ctx, queueKey, userID)

				// Remove timeout
				s.redisClient.ZRem(ctx, queueTimeoutKey, userID)

				// Remove user queue data
				userKey := fmt.Sprintf(userQueueKey, userID)
				s.redisClient.Del(ctx, userKey)

				log.Printf("Removed expired entry for user %s from matchmaking queue", userID)
			}

			// Release lock
			s.redisClient.Del(ctx, queueLockKey)

		case <-s.stopCh:
			return
		}
	}
}

// CreateCustomGame creates a custom game with the specified players
func (s *Service) CreateCustomGame(creatorID string, opponentIDs []string, gameType string) (*models.Game, error) {
	// Create the game
	game, err := s.gameService.CreateGame(creatorID, gameType)
	if err != nil {
		return nil, fmt.Errorf("failed to create game: %w", err)
	}

	// Add opponents to the game
	for _, opponentID := range opponentIDs {
		err = s.gameService.JoinGame(game.ID, opponentID)
		if err != nil {
			return nil, fmt.Errorf("failed to add opponent to game: %w", err)
		}
	}

	return game, nil
}
