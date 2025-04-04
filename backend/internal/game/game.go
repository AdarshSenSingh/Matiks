package game

import (
	"errors"
	"time"

	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/puzzle"
	"github.com/hectoclash/internal/repository"
)

// Service provides game functionality
type Service struct {
	gameRepo   *repository.GameRepository
	userRepo   *repository.UserRepository
	puzzleService *puzzle.Service
}

// NewService creates a new game service
func NewService(gameRepo *repository.GameRepository, userRepo *repository.UserRepository, puzzleService *puzzle.Service) *Service {
	return &Service{
		gameRepo:   gameRepo,
		userRepo:   userRepo,
		puzzleService: puzzleService,
	}
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

	// If game has enough players (2 for duel), change status to active
	if len(game.Players) + 1 >= 2 && game.GameType == "duel" {
		game.Status = models.GameStatusActive
		now := time.Now()
		game.StartedAt = &now

		// Update game in database
		err = s.gameRepo.Update(game)
		if err != nil {
			return err
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
	isCorrect, err := s.puzzleService.ValidateSolution(game.ID, solution)
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
	player.IsCorrect = &isCorrect
	player.Attempts++

	// If solution is correct, mark player as finished
	if isCorrect {
		now := time.Now()
		player.FinishedAt = &now

		// Calculate score and rating change
		user, err := s.userRepo.FindByID(userID)
		if err != nil {
			return err
		}

		// Calculate ELO change
		eloChange := s.puzzleService.CalculateELOChange(
			user.Rating,
			s.puzzleService.GetPuzzleDifficultyRating(models.DifficultyLevel(game.Difficulty)),
			isCorrect,
			solveTime,
		)

		// Update player's score and rating change
		score := int(100 - solveTime/10)
		if score < 10 {
			score = 10
		}
		player.Score = &score
		player.RatingChange = &eloChange

		// Update user's rating
		user.Rating += eloChange
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

		// Update puzzle stats
		err = s.puzzleService.UpdatePuzzleStats(game.ID, solveTime, isCorrect)
		if err != nil {
			return err
		}

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
