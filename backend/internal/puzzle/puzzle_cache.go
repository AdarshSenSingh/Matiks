package puzzle

import (
	"sync"
	"time"

	"github.com/hectoclash/internal/models"
)

// PuzzleCache provides caching for puzzles
type PuzzleCache struct {
	cache      map[string]*CachedPuzzle
	eloCache   map[int][]*CachedPuzzle
	mutex      sync.RWMutex
	maxSize    int
	expiration time.Duration
}

// CachedPuzzle represents a cached puzzle with metadata
type CachedPuzzle struct {
	Puzzle    *models.Puzzle
	CreatedAt time.Time
}

// NewPuzzleCache creates a new puzzle cache
func NewPuzzleCache(maxSize int, expiration time.Duration) *PuzzleCache {
	return &PuzzleCache{
		cache:      make(map[string]*CachedPuzzle),
		eloCache:   make(map[int][]*CachedPuzzle),
		maxSize:    maxSize,
		expiration: expiration,
	}
}

// Get gets a puzzle from the cache by ID
func (c *PuzzleCache) Get(id string) *models.Puzzle {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	cached, ok := c.cache[id]
	if !ok {
		return nil
	}

	// Check if the cached puzzle has expired
	if time.Since(cached.CreatedAt) > c.expiration {
		delete(c.cache, id)
		return nil
	}

	return cached.Puzzle
}

// GetBySequence gets a puzzle from the cache by sequence
func (c *PuzzleCache) GetBySequence(sequence string) *models.Puzzle {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	for _, cached := range c.cache {
		if cached.Puzzle.Sequence == sequence {
			// Check if the cached puzzle has expired
			if time.Since(cached.CreatedAt) > c.expiration {
				delete(c.cache, cached.Puzzle.ID)
				return nil
			}
			return cached.Puzzle
		}
	}

	return nil
}

// GetByELO gets a random puzzle from the cache suitable for a specific ELO rating
func (c *PuzzleCache) GetByELO(elo int) *models.Puzzle {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	// Check if we have puzzles cached for this ELO range
	puzzles, ok := c.eloCache[elo/100*100] // Round down to nearest 100
	if !ok || len(puzzles) == 0 {
		return nil
	}

	// Get a random puzzle from the cache
	for i := 0; i < len(puzzles); i++ {
		// Check if the cached puzzle has expired
		if time.Since(puzzles[i].CreatedAt) > c.expiration {
			continue
		}
		return puzzles[i].Puzzle
	}

	return nil
}

// Set adds a puzzle to the cache
func (c *PuzzleCache) Set(puzzle *models.Puzzle) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Check if the cache is full
	if len(c.cache) >= c.maxSize {
		// Remove the oldest puzzle
		var oldestID string
		var oldestTime time.Time
		for id, cached := range c.cache {
			if oldestID == "" || cached.CreatedAt.Before(oldestTime) {
				oldestID = id
				oldestTime = cached.CreatedAt
			}
		}
		delete(c.cache, oldestID)
	}

	// Add the puzzle to the cache
	c.cache[puzzle.ID] = &CachedPuzzle{
		Puzzle:    puzzle,
		CreatedAt: time.Now(),
	}

	// Add the puzzle to the ELO cache
	eloKey := puzzle.MinELO / 100 * 100 // Round down to nearest 100
	c.eloCache[eloKey] = append(c.eloCache[eloKey], &CachedPuzzle{
		Puzzle:    puzzle,
		CreatedAt: time.Now(),
	})
}

// Remove removes a puzzle from the cache
func (c *PuzzleCache) Remove(id string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	cached, ok := c.cache[id]
	if !ok {
		return
	}

	// Remove from the main cache
	delete(c.cache, id)

	// Remove from the ELO cache
	eloKey := cached.Puzzle.MinELO / 100 * 100 // Round down to nearest 100
	puzzles := c.eloCache[eloKey]
	for i, p := range puzzles {
		if p.Puzzle.ID == id {
			c.eloCache[eloKey] = append(puzzles[:i], puzzles[i+1:]...)
			break
		}
	}
}

// Clear clears the cache
func (c *PuzzleCache) Clear() {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.cache = make(map[string]*CachedPuzzle)
	c.eloCache = make(map[int][]*CachedPuzzle)
}

// Size returns the number of puzzles in the cache
func (c *PuzzleCache) Size() int {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	return len(c.cache)
}

// Cleanup removes expired puzzles from the cache
func (c *PuzzleCache) Cleanup() {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	now := time.Now()
	for id, cached := range c.cache {
		if now.Sub(cached.CreatedAt) > c.expiration {
			delete(c.cache, id)
		}
	}

	// Clean up ELO cache
	for elo, puzzles := range c.eloCache {
		newPuzzles := []*CachedPuzzle{}
		for _, p := range puzzles {
			if now.Sub(p.CreatedAt) <= c.expiration {
				newPuzzles = append(newPuzzles, p)
			}
		}
		if len(newPuzzles) == 0 {
			delete(c.eloCache, elo)
		} else {
			c.eloCache[elo] = newPuzzles
		}
	}
}
