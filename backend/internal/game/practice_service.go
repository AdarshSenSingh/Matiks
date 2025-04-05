package game

import (
	"errors"
	"log"
	"time"

	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/puzzle"
	"github.com/hectoclash/internal/repository"
)

// PracticeService provides functionality for practice mode
type PracticeService struct {
	gameRepo      *repository.GameRepository
	userRepo      *repository.UserRepository
	puzzleService *puzzle.Service
	eventService  *EventService
}

// NewPracticeService creates a new practice service
func NewPracticeService(
	gameRepo *repository.GameRepository,
	userRepo *repository.UserRepository,
	puzzleService *puzzle.Service,
	eventService *EventService,
) *PracticeService {
	return &PracticeService{
		gameRepo:      gameRepo,
		userRepo:      userRepo,
		puzzleService: puzzleService,
		eventService:  eventService,
	}
}

// PracticeSessionConfig represents configuration for a practice session
type PracticeSessionConfig struct {
	UserID    string `json:"user_id"`
	TimedMode bool   `json:"timed_mode"` // true for timed (60s per question), false for untimed
	StartELO  int    `json:"start_elo"`  // Starting ELO for the session (default: user's current ELO)
}

// PracticeSession represents a practice session
type PracticeSession struct {
	ID            string                 `json:"id"`
	UserID        string                 `json:"user_id"`
	TimedMode     bool                   `json:"timed_mode"`
	CurrentELO    int                    `json:"current_elo"`
	StartELO      int                    `json:"start_elo"`
	CurrentPuzzle *models.Puzzle         `json:"current_puzzle"`
	GameID        string                 `json:"game_id"`
	StartedAt     time.Time              `json:"started_at"`
	LastUpdatedAt time.Time              `json:"last_updated_at"`
	CompletedAt   *time.Time             `json:"completed_at,omitempty"`
	PuzzlesSolved int                    `json:"puzzles_solved"`
	Status        string                 `json:"status"` // "active", "completed", "failed"
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// CreatePracticeSession creates a new practice session
func (s *PracticeService) CreatePracticeSession(config PracticeSessionConfig) (*PracticeSession, error) {
	// Get user's current ELO if not specified
	if config.StartELO <= 0 {
		user, err := s.userRepo.FindByID(config.UserID)
		if err != nil {
			return nil, err
		}
		config.StartELO = user.Rating
	}

	// Create a new practice session
	session := &PracticeSession{
		ID:            generateUUID(),
		UserID:        config.UserID,
		TimedMode:     config.TimedMode,
		CurrentELO:    config.StartELO,
		StartELO:      config.StartELO,
		StartedAt:     time.Now(),
		LastUpdatedAt: time.Now(),
		PuzzlesSolved: 0,
		Status:        "active",
		Metadata:      make(map[string]interface{}),
	}

	// Generate the first puzzle
	err := s.generateNextPuzzle(session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// generateNextPuzzle generates the next puzzle for a practice session
func (s *PracticeService) generateNextPuzzle(session *PracticeSession) error {
	// Get a puzzle suitable for the current ELO
	puzzle, err := s.puzzleService.GetPuzzleForUser(session.CurrentELO)
	if err != nil {
		return err
	}

	// Create a new game for this puzzle
	game := &models.Game{
		PuzzleSequence: puzzle.Sequence,
		Status:         models.GameStatusActive,
		GameType:       "practice",
		Difficulty:     int(puzzle.Difficulty),
	}

	// Save the game
	err = s.gameRepo.Create(game)
	if err != nil {
		return err
	}

	// Add user as a player
	player := &models.Player{
		GameID: game.ID,
		UserID: session.UserID,
	}

	err = s.gameRepo.AddPlayerToGame(player)
	if err != nil {
		return err
	}

	// Start the game
	now := time.Now()
	game.Status = models.GameStatusActive
	game.StartedAt = &now

	err = s.gameRepo.Update(game)
	if err != nil {
		return err
	}

	// Update session
	session.CurrentPuzzle = puzzle
	session.GameID = game.ID
	session.LastUpdatedAt = now

	return nil
}

// SubmitSolution submits a solution for the current puzzle in a practice session
func (s *PracticeService) SubmitSolution(session *PracticeSession, solution string) (*puzzle.ValidationResult, error) {
	// Find game by ID
	game, err := s.gameRepo.FindByID(session.GameID)
	if err != nil {
		return nil, err
	}

	// Check if game is active
	if game.Status != models.GameStatusActive {
		return nil, errors.New("game is not active")
	}

	// Find player
	player, err := s.gameRepo.FindPlayerByGameAndUser(session.GameID, session.UserID)
	if err != nil {
		return nil, err
	}

	// Validate solution
	validationResult, err := s.puzzleService.ValidateSolution(game.ID, solution, session.UserID)
	if err != nil {
		return nil, err
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

	// If solution is correct, mark player as finished
	if isCorrect {
		now := time.Now()
		player.FinishedAt = &now

		// Use the score and rating change from the validation result
		score := validationResult.Score
		player.Score = &score
		ratingChange := validationResult.RatingChange
		player.RatingChange = &ratingChange

		// Update game status
		game.Status = models.GameStatusCompleted
		game.CompletedAt = &now
		game.WinnerID = &session.UserID

		if game.StartedAt != nil {
			duration := now.Sub(*game.StartedAt).Seconds()
			game.Duration = &duration
		}

		// Update game in database
		err = s.gameRepo.Update(game)
		if err != nil {
			return nil, err
		}

		// Update player in database
		err = s.gameRepo.UpdatePlayer(player)
		if err != nil {
			return nil, err
		}

		// Update session
		session.PuzzlesSolved++
		session.CurrentELO += ratingChange
		session.LastUpdatedAt = now

		// Update user's rating if this is a ranked practice session
		user, err := s.userRepo.FindByID(session.UserID)
		if err != nil {
			return nil, err
		}

		user.Rating += ratingChange
		err = s.userRepo.Update(user)
		if err != nil {
			return nil, err
		}

		// Update user stats
		stats, err := s.userRepo.GetUserStats(session.UserID)
		if err != nil {
			return nil, err
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
			return nil, err
		}

		// Generate next puzzle
		err = s.generateNextPuzzle(session)
		if err != nil {
			log.Printf("Error generating next puzzle: %v", err)
			// Don't fail the request if we can't generate the next puzzle
		}
	} else {
		// Update player in database
		err = s.gameRepo.UpdatePlayer(player)
		if err != nil {
			return nil, err
		}

		// If timed mode and incorrect solution, check if time limit is exceeded
		if session.TimedMode {
			// In timed mode, the player has 60 seconds to solve the puzzle
			if solveTime > 60 {
				// Time limit exceeded, end the session
				now := time.Now()
				session.Status = "failed"
				session.CompletedAt = &now
				session.LastUpdatedAt = now
			}
		}
	}

	return validationResult, nil
}

// EndPracticeSession ends a practice session
func (s *PracticeService) EndPracticeSession(session *PracticeSession) error {
	now := time.Now()
	session.Status = "completed"
	session.CompletedAt = &now
	session.LastUpdatedAt = now

	// If there's an active game, mark it as completed
	if session.GameID != "" {
		game, err := s.gameRepo.FindByID(session.GameID)
		if err == nil && game.Status == models.GameStatusActive {
			game.Status = models.GameStatusCompleted
			game.CompletedAt = &now

			if game.StartedAt != nil {
				duration := now.Sub(*game.StartedAt).Seconds()
				game.Duration = &duration
			}

			// Update game in database
			err = s.gameRepo.Update(game)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// Helper function to generate a UUID
func generateUUID() string {
	return "practice-" + time.Now().Format("20060102150405") + "-" + randomString(8)
}

// Helper function to generate a random string
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(result)
}
