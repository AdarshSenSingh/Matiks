package repository

import (
	"time"

	"github.com/hectoclash/internal/models"
	"gorm.io/gorm"
)

// SolutionMetrics represents metrics for a solution
type SolutionMetrics struct {
	ID              string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID          string    `json:"user_id" gorm:"type:uuid;not null;index"`
	User            models.User `json:"-" gorm:"foreignKey:UserID"`
	PuzzleID        string    `json:"puzzle_id" gorm:"type:uuid;not null;index"`
	Puzzle          models.Puzzle `json:"-" gorm:"foreignKey:PuzzleID"`
	Solution        string    `json:"solution" gorm:"not null"`
	IsCorrect       bool      `json:"is_correct" gorm:"not null"`
	ExecutionTime   float64   `json:"execution_time" gorm:"not null"` // in milliseconds
	Complexity      float64   `json:"complexity" gorm:"not null"`
	OperatorCount   int       `json:"operator_count" gorm:"not null"`
	ParenthesesCount int      `json:"parentheses_count" gorm:"not null"`
	Score           int       `json:"score" gorm:"not null"`
	RatingChange    int       `json:"rating_change" gorm:"not null"`
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// SolutionMetricsRepository handles database operations for solution metrics
type SolutionMetricsRepository struct {
	db *gorm.DB
}

// NewSolutionMetricsRepository creates a new solution metrics repository
func NewSolutionMetricsRepository(db *gorm.DB) *SolutionMetricsRepository {
	return &SolutionMetricsRepository{db: db}
}

// Create creates a new solution metrics record
func (r *SolutionMetricsRepository) Create(metrics *SolutionMetrics) error {
	return r.db.Create(metrics).Error
}

// FindByID finds solution metrics by ID
func (r *SolutionMetricsRepository) FindByID(id string) (*SolutionMetrics, error) {
	var metrics SolutionMetrics
	err := r.db.Preload("User").Preload("Puzzle").First(&metrics, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &metrics, nil
}

// FindByUserAndPuzzle finds solution metrics by user ID and puzzle ID
func (r *SolutionMetricsRepository) FindByUserAndPuzzle(userID, puzzleID string) ([]SolutionMetrics, error) {
	var metrics []SolutionMetrics
	err := r.db.Preload("User").Preload("Puzzle").
		Where("user_id = ? AND puzzle_id = ?", userID, puzzleID).
		Order("created_at DESC").
		Find(&metrics).Error
	return metrics, err
}

// FindByUser finds solution metrics by user ID
func (r *SolutionMetricsRepository) FindByUser(userID string, limit, offset int) ([]SolutionMetrics, error) {
	var metrics []SolutionMetrics
	err := r.db.Preload("User").Preload("Puzzle").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&metrics).Error
	return metrics, err
}

// FindByPuzzle finds solution metrics by puzzle ID
func (r *SolutionMetricsRepository) FindByPuzzle(puzzleID string, limit, offset int) ([]SolutionMetrics, error) {
	var metrics []SolutionMetrics
	err := r.db.Preload("User").Preload("Puzzle").
		Where("puzzle_id = ?", puzzleID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&metrics).Error
	return metrics, err
}

// GetUserAverageMetrics gets average metrics for a user
func (r *SolutionMetricsRepository) GetUserAverageMetrics(userID string) (map[string]float64, error) {
	var result struct {
		AvgExecutionTime   float64
		AvgComplexity      float64
		AvgOperatorCount   float64
		AvgParenthesesCount float64
		AvgScore           float64
		AvgRatingChange    float64
		CorrectPercentage  float64
	}

	err := r.db.Model(&SolutionMetrics{}).
		Select("AVG(execution_time) as avg_execution_time, " +
			"AVG(complexity) as avg_complexity, " +
			"AVG(operator_count) as avg_operator_count, " +
			"AVG(parentheses_count) as avg_parentheses_count, " +
			"AVG(score) as avg_score, " +
			"AVG(rating_change) as avg_rating_change, " +
			"SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as correct_percentage").
		Where("user_id = ?", userID).
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return map[string]float64{
		"avg_execution_time":    result.AvgExecutionTime,
		"avg_complexity":        result.AvgComplexity,
		"avg_operator_count":    result.AvgOperatorCount,
		"avg_parentheses_count": result.AvgParenthesesCount,
		"avg_score":             result.AvgScore,
		"avg_rating_change":     result.AvgRatingChange,
		"correct_percentage":    result.CorrectPercentage,
	}, nil
}

// GetPuzzleAverageMetrics gets average metrics for a puzzle
func (r *SolutionMetricsRepository) GetPuzzleAverageMetrics(puzzleID string) (map[string]float64, error) {
	var result struct {
		AvgExecutionTime   float64
		AvgComplexity      float64
		AvgOperatorCount   float64
		AvgParenthesesCount float64
		AvgScore           float64
		CorrectPercentage  float64
	}

	err := r.db.Model(&SolutionMetrics{}).
		Select("AVG(execution_time) as avg_execution_time, " +
			"AVG(complexity) as avg_complexity, " +
			"AVG(operator_count) as avg_operator_count, " +
			"AVG(parentheses_count) as avg_parentheses_count, " +
			"AVG(score) as avg_score, " +
			"SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as correct_percentage").
		Where("puzzle_id = ?", puzzleID).
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return map[string]float64{
		"avg_execution_time":    result.AvgExecutionTime,
		"avg_complexity":        result.AvgComplexity,
		"avg_operator_count":    result.AvgOperatorCount,
		"avg_parentheses_count": result.AvgParenthesesCount,
		"avg_score":             result.AvgScore,
		"correct_percentage":    result.CorrectPercentage,
	}, nil
}
