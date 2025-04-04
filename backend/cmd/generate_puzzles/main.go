package main

import (
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/hectoclash/internal/config"
	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/puzzle"
	"github.com/hectoclash/internal/repository"
)

func main() {
	// Parse command line arguments
	countPerDifficulty := flag.Int("count", 10, "Number of puzzles to generate per difficulty level")
	difficultyFlag := flag.Int("difficulty", 0, "Generate puzzles for a specific difficulty (1-5, 0 for all)")
	cleanFlag := flag.Bool("clean", false, "Clean existing puzzles before generating new ones")
	flag.Parse()

	// Create a simple configuration
	cfg := &config.Config{
		Database: config.DatabaseConfig{
			Host:     "localhost",
			Port:     "5432",
			User:     "postgres",
			Password: "postgres",
			Name:     "hectoclash",
			SSLMode:  "disable",
		},
	}

	// Initialize database
	db, err := repository.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize repositories
	puzzleRepo := repository.NewPuzzleRepository(db.DB)

	// Initialize services
	puzzleService := puzzle.NewService(puzzleRepo)

	// Clean existing puzzles if requested
	if *cleanFlag {
		fmt.Println("Cleaning existing puzzles...")
		// This would typically involve a call to delete all puzzles
		// For now, we'll just print a message
		fmt.Println("(Not implemented yet)")
	}

	// Start timer
	startTime := time.Now()

	// Pre-generate puzzles
	if *difficultyFlag > 0 && *difficultyFlag <= 5 {
		// Generate puzzles for a specific difficulty
		fmt.Printf("Generating %d puzzles for difficulty level %d...\n", *countPerDifficulty, *difficultyFlag)

		// Count existing puzzles for this difficulty
		existingCount, err := puzzleRepo.CountPuzzlesByDifficulty(models.DifficultyLevel(*difficultyFlag))
		if err != nil {
			log.Printf("Failed to count existing puzzles: %v", err)
		}

		// Calculate how many more puzzles we need
		needed := *countPerDifficulty - int(existingCount)
		if needed <= 0 {
			fmt.Printf("Already have %d puzzles for difficulty %d, no need to generate more\n", existingCount, *difficultyFlag)
		} else {
			fmt.Printf("Generating %d more puzzles for difficulty %d...\n", needed, *difficultyFlag)

			// Generate puzzles
			generator := puzzle.NewPuzzleGenerator()
			for i := 0; i < needed; i++ {
				fmt.Printf("Generating puzzle %d/%d...\r", i+1, needed)

				// Generate a puzzle with the requested difficulty
				sequence, solutions, err := generator.GeneratePuzzleWithDifficulty(*difficultyFlag)
				if err != nil {
					log.Printf("Failed to generate puzzle: %v", err)
					continue
				}

				// Find the optimal solution
				optimalSolution := generator.FindOptimalSolution(solutions)

				// Calculate complexity score
				complexityScore := 0.0
				for _, solution := range solutions {
					complexityScore += float64(len(solution))
				}
				complexityScore /= float64(len(solutions))

				// Create the puzzle
				puzzle := &models.Puzzle{
					Sequence:        sequence,
					Difficulty:      models.DifficultyLevel(*difficultyFlag),
					ComplexityScore: complexityScore,
					SolutionCount:   len(solutions),
					OptimalSolution: optimalSolution,
					Explanation:     generator.CreateExplanation(optimalSolution),
					MinELO:          (*difficultyFlag-1)*500,
					MaxELO:          *difficultyFlag*500,
				}

				// Save the puzzle
				err = puzzleRepo.Create(puzzle)
				if err != nil {
					log.Printf("Failed to save puzzle: %v", err)
				}
			}
			fmt.Println() // New line after progress indicator
		}
	} else {
		// Generate puzzles for all difficulty levels
		fmt.Printf("Generating %d puzzles per difficulty level...\n", *countPerDifficulty)
		err = puzzleService.PreGeneratePuzzles(*countPerDifficulty)
		if err != nil {
			log.Fatalf("Failed to pre-generate puzzles: %v", err)
		}
	}

	// Print statistics
	elapsed := time.Since(startTime)
	fmt.Printf("Generation completed in %s\n", elapsed)

	// Count puzzles by difficulty
	for difficulty := 1; difficulty <= 5; difficulty++ {
		count, err := puzzleRepo.CountPuzzlesByDifficulty(models.DifficultyLevel(difficulty))
		if err != nil {
			log.Printf("Failed to count puzzles for difficulty %d: %v", difficulty, err)
			continue
		}
		fmt.Printf("Difficulty %d: %d puzzles\n", difficulty, count)
	}

	// Count total puzzles
	totalCount, err := puzzleRepo.CountPuzzles()
	if err != nil {
		log.Printf("Failed to count total puzzles: %v", err)
	} else {
		fmt.Printf("Total puzzles: %d\n", totalCount)
	}
}
