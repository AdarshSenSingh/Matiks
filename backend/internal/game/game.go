package game

import (
	"errors"
	"log"
	"math"
	"time"

	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/puzzle"
	"github.com/hectoclash/internal/repository"
)

// Service provides game functionality
type Service struct {
	gameRepo     *repository.GameRepository
	userRepo     *repository.UserRepository
	puzzleService *puzzle.Service
	eventService  *EventService
	duelService   *DuelService
}

// NewService creates a new game service
func NewService(gameRepo *repository.GameRepository, userRepo *repository.UserRepository, puzzleService *puzzle.Service, eventService *EventService) *Service {
	service := &Service{
		gameRepo:     gameRepo,
		userRepo:     userRepo,
		puzzleService: puzzleService,
		eventService:  eventService,
	}

	// Initialize duel service
	service.duelService = NewDuelService(gameRepo, userRepo, eventService)

	return service
}

// CreateGame creates a new game
func (s *Service) CreateGame(creatorID string, gameType string) (*models.Game, error) {
	// Get user for ELO rating
	user, err := s.userRepo.FindByID(creatorID)
	if err != nil {
		return nil, err
	}

	// Get a puzzle suitable for the user's ELO rating
	puzzleObj, err := s.puzzleService.GetPuzzleForUser(user.Rating)
	if err != nil {
		return nil, err
	}

	// Create a new game
	game := &models.Game{
		PuzzleSequence: puzzleObj.Sequence,
		Status:         models.GameStatusWaiting,
		GameType:       gameType,
		Difficulty:     int(puzzleObj.Difficulty),
	}

	// Save the game
	err = s.gameRepo.Create(game)
	if err != nil {
		return nil, err
	}

	// Add creator as a player
	player := &models.Player{
		GameID: game.ID,
		UserID: creatorID,
	}

	// Save the player
	err = s.gameRepo.AddPlayerToGame(player)
	if err != nil {
		return nil, err
	}

	// Reload the game with player information
	game, err = s.gameRepo.FindByID(game.ID)
	if err != nil {
		return nil, err
	}

	// Notify clients that a game has been created
	if s.eventService != nil {
		go s.eventService.NotifyGameCreated(game)
	}

	// Create duel room if game type is duel
	if game.GameType == "duel" {
		_, err = s.duelService.CreateDuelRoom(game)
		if err != nil {
			log.Printf("Error creating duel room: %v", err)
		}
	}

	return game, nil
}

// JoinGame adds a player to a game
func (s *Service) JoinGame(gameID, userID string) error {
	// Find game by ID
	game, err := s.gameRepo.FindByID(gameID)
	if err != nil {
		return err
	}

	// Check if game is in waiting status
	if game.Status != models.GameStatusWaiting {
		return errors.New("game is not in waiting status")
	}

	// Check if user is already in the game
	for _, player := range game.Players {
		if player.UserID == userID {
			return errors.New("user is already in the game")
		}
	}

	// Add player to game
	player := &models.Player{
		GameID: gameID,
		UserID: userID,
	}

	// Save the player
	err = s.gameRepo.AddPlayerToGame(player)
	if err != nil {
		return err
	}

	// Reload the player with user information
	player, err = s.gameRepo.FindPlayerByGameAndUser(gameID, userID)
	if err != nil {
		return err
	}

	// Notify clients that a player has joined
	if s.eventService != nil {
		// Reload the game with updated player information
		game, err = s.gameRepo.FindByID(gameID)
		if err != nil {
			return err
		}

		go s.eventService.NotifyPlayerJoined(game, player)
	}

	// Join duel room if game type is duel
	if game.GameType == "duel" {
		err = s.duelService.JoinDuelRoom(gameID, userID)
		if err != nil {
			log.Printf("Error joining duel room: %v", err)
		}
	}

	// If game has enough players (2 for duel), change status to active
	if len(game.Players) + 1 >= 2 && game.GameType == "duel" {
		// Start the duel using the duel service
		err = s.duelService.StartDuel(gameID)
		if err != nil {
			log.Printf("Error starting duel: %v", err)

			// Fallback to manual start if duel service fails
			game.Status = models.GameStatusActive
			now := time.Now()
			game.StartedAt = &now

			// Update game in database
			err = s.gameRepo.Update(game)
			if err != nil {
				return err
			}

			// Notify clients that the game has started
			if s.eventService != nil {
				// Reload the game with updated information
				game, err = s.gameRepo.FindByID(gameID)
				if err != nil {
					return err
				}

				go s.eventService.NotifyGameStarted(game)
			}
		}
	}

	return nil
}

// SubmitSolution submits a solution for a game
func (s *Service) SubmitSolution(gameID, userID, solution string) error {
	// Find game by ID
	game, err := s.gameRepo.FindByID(gameID)
	if err != nil {
		return err
	}

	// Check if game is active
	if game.Status != models.GameStatusActive {
		return errors.New("game is not active")
	}

	// Find player
	player, err := s.gameRepo.FindPlayerByGameAndUser(gameID, userID)
	if err != nil {
		return err
	}

	// Validate solution
	validationResult, err := s.puzzleService.ValidateSolution(game.ID, solution, userID)
	if err != nil {
		return err
	}

	// Calculate solution time
	var solveTime float64
	if game.StartedAt != nil {
		solveTime = time.Since(*game.StartedAt).Seconds()
	}

	// Update player's solution
	player.SolutionSubmitted = &solution
	player.SolutionTime = &solveTime
	isCorrect := validationResult.IsCorrect
	player.IsCorrect = &isCorrect
	player.Attempts++

	// Calculate progress (0-100%)
	progress := float64(0)
	if isCorrect {
		progress = 1.0 // 100%
	} else {
		// Calculate progress based on attempts (more attempts = more progress)
		progress = math.Min(0.8, float64(player.Attempts) * 0.1) // Max 80% for incorrect solutions
	}

	// Update progress in duel room if game type is duel
	if game.GameType == "duel" {
		err = s.duelService.UpdatePlayerProgress(gameID, userID, progress)
		if err != nil {
			log.Printf("Error updating player progress in duel: %v", err)
		}
	} else {
		// Notify clients about the player's progress
		if s.eventService != nil {
			go s.eventService.NotifyPlayerProgress(gameID, userID, progress)
		}
	}

	// If solution is correct, mark player as finished
	if isCorrect {
		now := time.Now()
		player.FinishedAt = &now

		// Use the score and rating change from the validation result
		score := validationResult.Score
		player.Score = &score
		ratingChange := validationResult.RatingChange
		player.RatingChange = &ratingChange

		// Update solution in duel room if game type is duel
		if game.GameType == "duel" {
			err = s.duelService.SubmitSolution(gameID, userID, solution, isCorrect, score, *player.SolutionTime)
			if err != nil {
				log.Printf("Error submitting solution to duel: %v", err)
			}
		} else {
			// Notify clients that a solution has been submitted
			if s.eventService != nil {
				go s.eventService.NotifySolutionSubmitted(gameID, userID, solution, isCorrect, score)
			}
		}

		// Update user's rating
		user, err := s.userRepo.FindByID(userID)
		if err != nil {
			return err
		}

		user.Rating += ratingChange
		err = s.userRepo.Update(user)
		if err != nil {
			return err
		}

		// Update user stats
		stats, err := s.userRepo.GetUserStats(userID)
		if err != nil {
			return err
		}

		stats.GamesPlayed++
		stats.GamesWon++
		stats.Rating = user.Rating

		// Update streak
		stats.UpdateStreak(now)

		// Update average solve time
		if stats.AvgSolveTime == 0 {
			stats.AvgSolveTime = solveTime
		} else {
			stats.AvgSolveTime = (stats.AvgSolveTime*float64(stats.GamesPlayed-1) + solveTime) / float64(stats.GamesPlayed)
		}

		err = s.userRepo.UpdateUserStats(stats)
		if err != nil {
			return err
		}

		// Puzzle stats are already updated by the validation service

		// Check if all players have finished
		allFinished := true
		for _, p := range game.Players {
			if p.FinishedAt == nil {
				allFinished = false
				break
			}
		}

		// If all players have finished, mark game as completed
		if allFinished {
			game.Status = models.GameStatusCompleted
			game.CompletedAt = &now

			// Calculate game duration
			if game.StartedAt != nil {
				duration := now.Sub(*game.StartedAt).Seconds()
				game.Duration = &duration
			}

			// Determine winner
			var winnerID string
			var bestScore int
			for _, p := range game.Players {
				if p.Score != nil && *p.Score > bestScore {
					bestScore = *p.Score
					winnerID = p.UserID
				}
			}
			game.WinnerID = &winnerID

			// Update game in database
			err = s.gameRepo.Update(game)
			if err != nil {
				return err
			}

			// Notify clients that the game has ended
			if s.eventService != nil {
				// Reload the game with updated information
				game, err = s.gameRepo.FindByID(gameID)
				if err != nil {
					return err
				}

				go s.eventService.NotifyGameEnded(game)
			}
		}
	}

	// Update player in database
	err = s.gameRepo.UpdatePlayer(player)
	if err != nil {
		return err
	}

	return nil
}

// GetGame gets a game by ID
func (s *Service) GetGame(gameID string) (*models.Game, error) {
	return s.gameRepo.FindByID(gameID)
}

// GetActiveGames gets all active games
func (s *Service) GetActiveGames() ([]models.Game, error) {
	return s.gameRepo.FindActiveGames()
}

// GetGamesByUser gets all games for a user
func (s *Service) GetGamesByUser(userID string, limit, offset int) ([]models.Game, error) {
	return s.gameRepo.FindGamesByUserID(userID, limit, offset)
}

// CountGamesByUser counts all games for a user
func (s *Service) CountGamesByUser(userID string) (int64, error) {
	return s.gameRepo.CountGamesByUserID(userID)
}

// GetRecentGames gets recent games with pagination
func (s *Service) GetRecentGames(limit, offset int) ([]models.Game, error) {
	return s.gameRepo.FindRecentGames(limit, offset)
}

// CountGames counts all games
func (s *Service) CountGames() (int64, error) {
	return s.gameRepo.CountGames()
}

// GetDuelStatus gets the status of a duel
func (s *Service) GetDuelStatus(gameID string) (*models.GameResponse, error) {
	return s.duelService.GetDuelStatus(gameID)
}
