package game

import (
	"encoding/json"
	"log"
	"time"

	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/websocket"
)

// EventService handles game events and WebSocket communication
type EventService struct {
	hub *websocket.Hub
}

// NewEventService creates a new game event service
func NewEventService(hub *websocket.Hub) *EventService {
	return &EventService{
		hub: hub,
	}
}

// NotifyGameCreated notifies clients that a game has been created
func (s *EventService) NotifyGameCreated(game *models.Game) error {
	// Convert players to player payloads
	players := make([]websocket.PlayerPayload, len(game.Players))
	for i, player := range game.Players {
		players[i] = websocket.PlayerPayload{
			UserID:   player.UserID,
			Username: player.User.Username,
			Progress: 0,
		}
	}

	// Broadcast game state
	return s.hub.BroadcastGameState(
		game.ID,
		string(game.Status),
		players,
		nil,
		game.PuzzleSequence,
	)
}

// NotifyPlayerJoined notifies clients that a player has joined a game
func (s *EventService) NotifyPlayerJoined(game *models.Game, player *models.Player) error {
	// Convert players to player payloads
	players := make([]websocket.PlayerPayload, len(game.Players))
	for i, p := range game.Players {
		players[i] = websocket.PlayerPayload{
			UserID:   p.UserID,
			Username: p.User.Username,
			Progress: 0,
		}
	}

	// Broadcast game state
	return s.hub.BroadcastGameState(
		game.ID,
		string(game.Status),
		players,
		nil,
		game.PuzzleSequence,
	)
}

// NotifyGameStarted notifies clients that a game has started
func (s *EventService) NotifyGameStarted(game *models.Game) error {
	// Convert start time to milliseconds
	startTime := game.StartedAt.UnixNano() / int64(time.Millisecond)

	// Broadcast game start
	return s.hub.BroadcastGameStart(
		game.ID,
		startTime,
		game.PuzzleSequence,
	)
}

// NotifyPlayerProgress notifies clients about a player's progress
func (s *EventService) NotifyPlayerProgress(gameID, userID string, progress float64) error {
	// Create player progress payload
	payload := websocket.PlayerProgressPayload{
		Progress: progress,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &websocket.Message{
		Type:      websocket.MessageTypePlayerProgress,
		GameID:    gameID,
		UserID:    userID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Convert message to bytes
	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	// Broadcast message
	return s.hub.BroadcastToGame(gameID, msgBytes)
}

// NotifySolutionSubmitted notifies clients that a player has submitted a solution
func (s *EventService) NotifySolutionSubmitted(gameID, userID, solution string, isCorrect bool, score int) error {
	// Create solution submitted payload
	payload := websocket.SolutionSubmittedPayload{
		IsCorrect: isCorrect,
		Score:     score,
		Solution:  solution,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &websocket.Message{
		Type:      websocket.MessageTypeSolutionSubmitted,
		GameID:    gameID,
		UserID:    userID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Convert message to bytes
	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	// Broadcast message
	return s.hub.BroadcastToGame(gameID, msgBytes)
}

// NotifyGameEnded notifies clients that a game has ended
func (s *EventService) NotifyGameEnded(game *models.Game) error {
	// Check if game has a winner
	if game.WinnerID == nil {
		log.Printf("Game %s ended without a winner", game.ID)
		return nil
	}

	// Convert players to player payloads
	players := make([]websocket.PlayerPayload, len(game.Players))
	for i, player := range game.Players {
		var isCorrect *bool
		var score *int
		if player.IsCorrect != nil {
			isCorrect = player.IsCorrect
		}
		if player.Score != nil {
			score = player.Score
		}

		players[i] = websocket.PlayerPayload{
			UserID:    player.UserID,
			Username:  player.User.Username,
			Progress:  1.0, // Game is over, so progress is 100%
			IsCorrect: isCorrect,
			Score:     score,
		}
	}

	// Broadcast game end
	return s.hub.BroadcastGameEnd(
		game.ID,
		*game.WinnerID,
		players,
	)
}
