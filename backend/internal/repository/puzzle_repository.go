package repository

import (
	"errors"
	"math/rand"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// PuzzleRepository handles database operations for puzzles
type PuzzleRepository struct {
	db *gorm.DB
}

// NewPuzzleRepository creates a new puzzle repository
func NewPuzzleRepository(db *gorm.DB) *PuzzleRepository {
	return &PuzzleRepository{db: db}
}

// Create creates a new puzzle
func (r *PuzzleRepository) Create(puzzle *models.Puzzle) error {
	return r.db.Create(puzzle).Error
}

// CreateSolution creates a new puzzle solution
func (r *PuzzleRepository) CreateSolution(solution *models.PuzzleSolution) error {
	return r.db.Create(solution).Error
}

// FindByID finds a puzzle by ID
func (r *PuzzleRepository) FindByID(id string) (*models.Puzzle, error) {
	var puzzle models.Puzzle
	err := r.db.First(&puzzle, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("puzzle not found")
		}
		return nil, err
	}
	return &puzzle, nil
}

// FindBySequence finds a puzzle by sequence
func (r *PuzzleRepository) FindBySequence(sequence string) (*models.Puzzle, error) {
	var puzzle models.Puzzle
	err := r.db.Where("sequence = ?", sequence).First(&puzzle).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("puzzle not found")
		}
		return nil, err
	}
	return &puzzle, nil
}

// Update updates a puzzle
func (r *PuzzleRepository) Update(puzzle *models.Puzzle) error {
	return r.db.Save(puzzle).Error
}

// Delete deletes a puzzle
func (r *PuzzleRepository) Delete(id string) error {
	return r.db.Delete(&models.Puzzle{}, "id = ?", id).Error
}

// GetSolutions gets all solutions for a puzzle
func (r *PuzzleRepository) GetSolutions(puzzleID string) ([]models.PuzzleSolution, error) {
	var solutions []models.PuzzleSolution
	err := r.db.Where("puzzle_id = ?", puzzleID).Find(&solutions).Error
	return solutions, err
}

// GetOptimalSolution gets the optimal solution for a puzzle
func (r *PuzzleRepository) GetOptimalSolution(puzzleID string) (*models.PuzzleSolution, error) {
	var solution models.PuzzleSolution
	err := r.db.Where("puzzle_id = ? AND is_optimal = ?", puzzleID, true).First(&solution).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("optimal solution not found")
		}
		return nil, err
	}
	return &solution, nil
}

// GetPuzzlesByDifficulty gets puzzles by difficulty level
func (r *PuzzleRepository) GetPuzzlesByDifficulty(difficulty models.DifficultyLevel, limit, offset int) ([]models.Puzzle, error) {
	var puzzles []models.Puzzle
	err := r.db.Where("difficulty = ?", difficulty).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&puzzles).Error
	return puzzles, err
}

// GetPuzzlesByELORange gets puzzles suitable for a specific ELO rating
func (r *PuzzleRepository) GetPuzzlesByELORange(elo int, limit, offset int) ([]models.Puzzle, error) {
	var puzzles []models.Puzzle
	err := r.db.Where("min_elo <= ? AND max_elo >= ?", elo, elo).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&puzzles).Error
	return puzzles, err
}

// GetRandomPuzzleByELORange gets a random puzzle suitable for a specific ELO rating
func (r *PuzzleRepository) GetRandomPuzzleByELORange(elo int) (*models.Puzzle, error) {
	var puzzles []models.Puzzle
	err := r.db.Where("min_elo <= ? AND max_elo >= ?", elo, elo).Find(&puzzles).Error
	if err != nil {
		return nil, err
	}

	if len(puzzles) == 0 {
		return nil, errors.New("no puzzles found for this ELO range")
	}

	// Select a random puzzle
	randomIndex := rand.Intn(len(puzzles))
	return &puzzles[randomIndex], nil
}

// GetRandomPuzzleByDifficulty gets a random puzzle of a specific difficulty
func (r *PuzzleRepository) GetRandomPuzzleByDifficulty(difficulty models.DifficultyLevel) (*models.Puzzle, error) {
	var puzzles []models.Puzzle
	err := r.db.Where("difficulty = ?", difficulty).Find(&puzzles).Error
	if err != nil {
		return nil, err
	}

	if len(puzzles) == 0 {
		return nil, errors.New("no puzzles found for this difficulty")
	}

	// Select a random puzzle
	randomIndex := rand.Intn(len(puzzles))
	return &puzzles[randomIndex], nil
}

// UpdatePuzzleStats updates the statistics for a puzzle after a game
func (r *PuzzleRepository) UpdatePuzzleStats(puzzleID string, solveTime float64, isCorrect bool) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Get the puzzle
		var puzzle models.Puzzle
		if err := tx.First(&puzzle, "id = ?", puzzleID).Error; err != nil {
			return err
		}

		// Update usage count
		puzzle.UsageCount++

		// Update success rate and average solve time
		if isCorrect {
			// Calculate new success rate
			newSuccessCount := float64(puzzle.UsageCount) * puzzle.SuccessRate + 1
			puzzle.SuccessRate = newSuccessCount / float64(puzzle.UsageCount)

			// Calculate new average solve time
			if puzzle.AvgSolveTime == 0 {
				puzzle.AvgSolveTime = solveTime
			} else {
				puzzle.AvgSolveTime = (puzzle.AvgSolveTime*float64(puzzle.UsageCount-1) + solveTime) / float64(puzzle.UsageCount)
			}
		} else {
			// Calculate new success rate
			newSuccessCount := float64(puzzle.UsageCount) * puzzle.SuccessRate
			puzzle.SuccessRate = newSuccessCount / float64(puzzle.UsageCount)
		}

		// Save the updated puzzle
		return tx.Save(&puzzle).Error
	})
}

// CountPuzzles counts all puzzles
func (r *PuzzleRepository) CountPuzzles() (int64, error) {
	var count int64
	err := r.db.Model(&models.Puzzle{}).Count(&count).Error
	return count, err
}

// CountPuzzlesByDifficulty counts puzzles by difficulty
func (r *PuzzleRepository) CountPuzzlesByDifficulty(difficulty models.DifficultyLevel) (int64, error) {
	var count int64
	err := r.db.Model(&models.Puzzle{}).Where("difficulty = ?", difficulty).Count(&count).Error
	return count, err
}

// CountPuzzlesByELORange counts puzzles by ELO range
func (r *PuzzleRepository) CountPuzzlesByELORange(minELO, maxELO int) (int64, error) {
	var count int64
	err := r.db.Model(&models.Puzzle{}).Where("min_elo <= ? AND max_elo >= ?", maxELO, minELO).Count(&count).Error
	return count, err
}
