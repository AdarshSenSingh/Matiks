package matchmaking

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/hectoclash/internal/websocket"
)

// MatchProcessor handles the matching of players in the queue
type MatchProcessor struct {
	service   *Service
	stopCh    chan struct{}
	isRunning bool
}

// NewMatchProcessor creates a new match processor
func NewMatchProcessor(service *Service) *MatchProcessor {
	return &MatchProcessor{
		service:   service,
		stopCh:    make(chan struct{}),
		isRunning: false,
	}
}

// Start starts the match processor
func (p *MatchProcessor) Start() {
	if p.isRunning {
		return
	}

	p.isRunning = true
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			p.ProcessMatches()
		case <-p.stopCh:
			p.isRunning = false
			return
		}
	}
}

// Stop stops the match processor
func (p *MatchProcessor) Stop() {
	if !p.isRunning {
		return
	}

	close(p.stopCh)
}

// ProcessMatches processes the matchmaking queue and creates matches
func (p *MatchProcessor) ProcessMatches() {
	ctx := context.Background()

	// Acquire lock
	lockSuccess, err := p.service.redisClient.SetNX(ctx, queueLockKey, "1", lockTimeout).Result()
	if err != nil || !lockSuccess {
		return
	}
	defer p.service.redisClient.Del(ctx, queueLockKey)

	// Get queue length
	queueLength, err := p.service.redisClient.ZCard(ctx, queueKey).Result()
	if err != nil {
		log.Printf("Failed to get queue length: %v", err)
		return
	}

	// If queue is empty or has only one player, return
	if queueLength < 2 {
		return
	}

	// Get all players in queue
	players, err := p.service.redisClient.ZRangeWithScores(ctx, queueKey, 0, -1).Result()
	if err != nil {
		log.Printf("Failed to get players from queue: %v", err)
		return
	}

	// Process each player
	for i, player := range players {
		userID := player.Member.(string)
		rating := int(player.Score)

		// Skip if player is already matched
		userKey := fmt.Sprintf(userQueueKey, userID)
		exists, err := p.service.redisClient.Exists(ctx, userKey).Result()
		if err != nil || exists == 0 {
			continue
		}

		// Get player's queue data
		userDataJSON, err := p.service.redisClient.Get(ctx, userKey).Result()
		if err != nil {
			log.Printf("Failed to get queue data for user %s: %v", userID, err)
			continue
		}

		// Parse user data
		var userData struct {
			GameType string `json:"game_type"`
			Ranked   bool   `json:"ranked"`
		}

		err = json.Unmarshal([]byte(userDataJSON), &userData)
		if err != nil {
			log.Printf("Failed to parse queue data for user %s: %v", userID, err)
			continue
		}

		gameType := userData.GameType
		ranked := userData.Ranked

		// Get player's join time
		joinTimeScore, err := p.service.redisClient.ZScore(ctx, queueTimeoutKey, userID).Result()
		if err != nil {
			log.Printf("Failed to get join time for user %s: %v", userID, err)
			continue
		}

		joinTime := time.Unix(int64(joinTimeScore), 0).Add(-matchmakingTimeout)
		waitTime := time.Since(joinTime)

		// Calculate ELO range based on wait time
		eloRange := initialEloRange + int(math.Floor(waitTime.Seconds()/eloRangeIncrementInterval.Seconds()))*eloRangeIncrement
		if eloRange > maxEloRange {
			eloRange = maxEloRange
		}

		// Find a match
		matched := false
		var matchedUserID string

		for j, otherPlayer := range players {
			if i == j {
				continue
			}

			otherUserID := otherPlayer.Member.(string)
			otherRating := int(otherPlayer.Score)

			// Skip if other player is already matched
			otherUserKey := fmt.Sprintf(userQueueKey, otherUserID)
			exists, err := p.service.redisClient.Exists(ctx, otherUserKey).Result()
			if err != nil || exists == 0 {
				continue
			}

			// Get other player's game type
			otherGameType, err := p.service.redisClient.Get(ctx, otherUserKey).Result()
			if err != nil {
				log.Printf("Failed to get game type for user %s: %v", otherUserID, err)
				continue
			}

			// Skip if game types don't match
			if gameType != otherGameType {
				continue
			}

			// Check if ratings are within range
			if math.Abs(float64(rating-otherRating)) <= float64(eloRange) {
				matched = true
				matchedUserID = otherUserID
				break
			}
		}

		// If a match is found, create a game
		if matched {
			// Create game
			game, err := p.service.gameService.CreateGame(userID, gameType)
			if err != nil {
				log.Printf("Failed to create game: %v", err)
				continue
			}

			// Add matched player to game
			err = p.service.gameService.JoinGame(game.ID, matchedUserID)
			if err != nil {
				log.Printf("Failed to add player to game: %v", err)
				continue
			}

			// Store game ID for both players
			userGameKey1 := fmt.Sprintf(userGameKey, userID)
			userGameKey2 := fmt.Sprintf(userGameKey, matchedUserID)
			p.service.redisClient.Set(ctx, userGameKey1, game.ID, time.Hour)
			p.service.redisClient.Set(ctx, userGameKey2, game.ID, time.Hour)

			// Get user data for WebSocket notifications
			user1, err := p.service.userRepo.FindByID(userID)
			if err != nil {
				log.Printf("Failed to get user data for WebSocket notification: %v", err)
			}

			user2, err := p.service.userRepo.FindByID(matchedUserID)
			if err != nil {
				log.Printf("Failed to get user data for WebSocket notification: %v", err)
			}

			// Get clients for both players
			if p.service.websocketHub != nil {
				// Find clients for both players
				client1 := p.service.websocketHub.GetClientByUserID(userID)
				client2 := p.service.websocketHub.GetClientByUserID(matchedUserID)

				// Create player payloads
				player1Payload := websocket.PlayerPayload{
					UserID:   userID,
					Username: user1.Username,
					Progress: 0,
				}

				player2Payload := websocket.PlayerPayload{
					UserID:   matchedUserID,
					Username: user2.Username,
					Progress: 0,
				}

				// Send match found notifications
				if client1 != nil {
					err := p.service.websocketHub.SendMatchFound(client1, game.ID, gameType, player2Payload, ranked)
					if err != nil {
						log.Printf("Failed to send match found notification to player 1: %v", err)
					}
				}

				if client2 != nil {
					err := p.service.websocketHub.SendMatchFound(client2, game.ID, gameType, player1Payload, ranked)
					if err != nil {
						log.Printf("Failed to send match found notification to player 2: %v", err)
					}
				}
			}

			// Remove both players from queue
			p.service.redisClient.ZRem(ctx, queueKey, userID)
			p.service.redisClient.ZRem(ctx, queueKey, matchedUserID)
			p.service.redisClient.ZRem(ctx, queueTimeoutKey, userID)
			p.service.redisClient.ZRem(ctx, queueTimeoutKey, matchedUserID)
			p.service.redisClient.Del(ctx, userKey)
			p.service.redisClient.Del(ctx, fmt.Sprintf(userQueueKey, matchedUserID))

			log.Printf("Created game %s for users %s and %s", game.ID, userID, matchedUserID)
		}
	}
}
