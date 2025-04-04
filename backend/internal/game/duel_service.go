package game

import (
	"errors"
	"log"
	"sync"
	"time"

	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/repository"
	"github.com/hectoclash/internal/websocket"
)

// DuelRoom represents a room for a duel game
type DuelRoom struct {
	GameID        string
	Players       map[string]*DuelPlayer
	Status        models.GameStatus
	StartTime     *time.Time
	PuzzleSequence string
	Mutex         sync.RWMutex
}

// DuelPlayer represents a player in a duel
type DuelPlayer struct {
	UserID       string
	Username     string
	Progress     float64
	IsCorrect    bool
	SolutionTime float64
	Score        int
}

// DuelService handles duel-specific functionality
type DuelService struct {
	gameRepo     *repository.GameRepository
	userRepo     *repository.UserRepository
	eventService *EventService
	rooms        map[string]*DuelRoom
	mutex        sync.RWMutex
}

// NewDuelService creates a new duel service
func NewDuelService(gameRepo *repository.GameRepository, userRepo *repository.UserRepository, eventService *EventService) *DuelService {
	return &DuelService{
		gameRepo:     gameRepo,
		userRepo:     userRepo,
		eventService: eventService,
		rooms:        make(map[string]*DuelRoom),
	}
}

// CreateDuelRoom creates a new duel room
func (s *DuelService) CreateDuelRoom(game *models.Game) (*DuelRoom, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Check if room already exists
	if _, exists := s.rooms[game.ID]; exists {
		return nil, errors.New("duel room already exists")
	}

	// Create new room
	room := &DuelRoom{
		GameID:        game.ID,
		Players:       make(map[string]*DuelPlayer),
		Status:        game.Status,
		PuzzleSequence: game.PuzzleSequence,
	}

	// Add players to room
	for _, player := range game.Players {
		room.Players[player.UserID] = &DuelPlayer{
			UserID:   player.UserID,
			Username: player.User.Username,
			Progress: 0,
		}
	}

	// Set start time if game is active
	if game.Status == models.GameStatusActive && game.StartedAt != nil {
		room.StartTime = game.StartedAt
	}

	// Store room
	s.rooms[game.ID] = room

	return room, nil
}

// GetDuelRoom gets a duel room by game ID
func (s *DuelService) GetDuelRoom(gameID string) (*DuelRoom, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	room, exists := s.rooms[gameID]
	if !exists {
		// Try to load the room from the database
		game, err := s.gameRepo.FindByID(gameID)
		if err != nil {
			return nil, err
		}

		// Create room from game
		s.mutex.RUnlock()
		room, err = s.CreateDuelRoom(game)
		if err != nil {
			return nil, err
		}
		return room, nil
	}

	return room, nil
}

// JoinDuelRoom adds a player to a duel room
func (s *DuelService) JoinDuelRoom(gameID, userID string) error {
	// Get duel room
	room, err := s.GetDuelRoom(gameID)
	if err != nil {
		return err
	}

	// Get user
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	// Add player to room
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	// Check if player is already in room
	if _, exists := room.Players[userID]; exists {
		return nil
	}

	// Add player to room
	room.Players[userID] = &DuelPlayer{
		UserID:   userID,
		Username: user.Username,
		Progress: 0,
	}

	// Notify clients that a player has joined
	if s.eventService != nil {
		// Convert players to player payloads
		players := make([]websocket.PlayerPayload, 0, len(room.Players))
		for id, player := range room.Players {
			players = append(players, websocket.PlayerPayload{
				UserID:   id,
				Username: player.Username,
				Progress: player.Progress,
			})
		}

		// Broadcast game state
		err = s.eventService.hub.BroadcastGameState(
			gameID,
			string(room.Status),
			players,
			nil,
			room.PuzzleSequence,
		)
		if err != nil {
			log.Printf("Error broadcasting game state: %v", err)
		}
	}

	return nil
}

// StartDuel starts a duel
func (s *DuelService) StartDuel(gameID string) error {
	// Get duel room
	room, err := s.GetDuelRoom(gameID)
	if err != nil {
		return err
	}

	// Update room status
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	// Check if room is already active
	if room.Status == models.GameStatusActive {
		return errors.New("duel is already active")
	}

	// Check if room has enough players
	if len(room.Players) < 2 {
		return errors.New("not enough players to start duel")
	}

	// Update room status
	room.Status = models.GameStatusActive
	now := time.Now()
	room.StartTime = &now

	// Update game in database
	game, err := s.gameRepo.FindByID(gameID)
	if err != nil {
		return err
	}

	game.Status = models.GameStatusActive
	game.StartedAt = &now

	err = s.gameRepo.Update(game)
	if err != nil {
		return err
	}

	// Notify clients that the duel has started
	if s.eventService != nil {
		// Convert start time to milliseconds
		startTime := now.UnixNano() / int64(time.Millisecond)

		// Broadcast game start
		err = s.eventService.hub.BroadcastGameStart(
			gameID,
			startTime,
			room.PuzzleSequence,
		)
		if err != nil {
			log.Printf("Error broadcasting game start: %v", err)
		}
	}

	return nil
}

// UpdatePlayerProgress updates a player's progress in a duel
func (s *DuelService) UpdatePlayerProgress(gameID, userID string, progress float64) error {
	// Get duel room
	room, err := s.GetDuelRoom(gameID)
	if err != nil {
		return err
	}

	// Update player progress
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	// Check if player is in room
	player, exists := room.Players[userID]
	if !exists {
		return errors.New("player not in duel")
	}

	// Update player progress
	player.Progress = progress

	// Notify clients about the player's progress
	if s.eventService != nil {
		err = s.eventService.NotifyPlayerProgress(gameID, userID, progress)
		if err != nil {
			log.Printf("Error notifying player progress: %v", err)
		}
	}

	return nil
}

// SubmitSolution submits a solution for a duel
func (s *DuelService) SubmitSolution(gameID, userID, solution string, isCorrect bool, score int, solutionTime float64) error {
	// Get duel room
	room, err := s.GetDuelRoom(gameID)
	if err != nil {
		return err
	}

	// Update player solution
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	// Check if player is in room
	player, exists := room.Players[userID]
	if !exists {
		return errors.New("player not in duel")
	}

	// Update player solution
	player.IsCorrect = isCorrect
	player.Score = score
	player.SolutionTime = solutionTime
	player.Progress = 1.0 // 100% progress when solution is submitted

	// Notify clients about the solution
	if s.eventService != nil {
		err = s.eventService.NotifySolutionSubmitted(gameID, userID, solution, isCorrect, score)
		if err != nil {
			log.Printf("Error notifying solution submitted: %v", err)
		}
	}

	// Check if all players have submitted solutions
	allSubmitted := true
	for _, p := range room.Players {
		if p.Progress < 1.0 {
			allSubmitted = false
			break
		}
	}

	// If all players have submitted solutions, end the duel
	if allSubmitted {
		// Find the winner
		var winnerID string
		var bestScore int
		for id, p := range room.Players {
			if p.IsCorrect && p.Score > bestScore {
				bestScore = p.Score
				winnerID = id
			}
		}

		// Update game in database
		game, err := s.gameRepo.FindByID(gameID)
		if err != nil {
			return err
		}

		game.Status = models.GameStatusCompleted
		now := time.Now()
		game.CompletedAt = &now

		// Calculate game duration
		if game.StartedAt != nil {
			duration := now.Sub(*game.StartedAt).Seconds()
			game.Duration = &duration
		}

		// Set winner
		if winnerID != "" {
			game.WinnerID = &winnerID
		}

		err = s.gameRepo.Update(game)
		if err != nil {
			return err
		}

		// Update room status
		room.Status = models.GameStatusCompleted

		// Notify clients that the duel has ended
		if s.eventService != nil && winnerID != "" {
			// Convert players to player payloads
			players := make([]websocket.PlayerPayload, 0, len(room.Players))
			for id, p := range room.Players {
				isCorrect := p.IsCorrect
				score := p.Score
				players = append(players, websocket.PlayerPayload{
					UserID:    id,
					Username:  p.Username,
					Progress:  1.0,
					IsCorrect: &isCorrect,
					Score:     &score,
				})
			}

			// Broadcast game end
			err = s.eventService.hub.BroadcastGameEnd(
				gameID,
				winnerID,
				players,
			)
			if err != nil {
				log.Printf("Error broadcasting game end: %v", err)
			}
		}

		// Remove room after a delay
		go func() {
			time.Sleep(5 * time.Minute)
			s.mutex.Lock()
			delete(s.rooms, gameID)
			s.mutex.Unlock()
		}()
	}

	return nil
}

// GetDuelStatus gets the status of a duel
func (s *DuelService) GetDuelStatus(gameID string) (*models.GameResponse, error) {
	// Get game from database
	game, err := s.gameRepo.FindByID(gameID)
	if err != nil {
		return nil, err
	}

	// Convert to response
	response := game.ToResponse()

	// Get duel room
	room, err := s.GetDuelRoom(gameID)
	if err == nil {
		// Update player progress from room
		room.Mutex.RLock()
		defer room.Mutex.RUnlock()

		for i, player := range response.Players {
			if roomPlayer, exists := room.Players[player.UserID]; exists {
				// Only update progress if it's higher in the room
				if roomPlayer.Progress > 0 {
					// Create a copy to avoid modifying the original
					progress := roomPlayer.Progress
					response.Players[i].Progress = &progress
				}
			}
		}
	}

	return &response, nil
}
