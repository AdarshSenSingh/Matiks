package matchmaking

import (
	"errors"
	"time"
)

// Queue represents the matchmaking queue
type Queue struct {
	users []QueueEntry
}

// QueueEntry represents a user in the matchmaking queue
type QueueEntry struct {
	UserID    string
	Rating    int
	JoinedAt  time.Time
	Searching bool
}

// Service provides matchmaking functionality
type Service struct {
	queue *Queue
	// TODO: Add dependencies like game service
}

// NewService creates a new matchmaking service
func NewService() *Service {
	return &Service{
		queue: &Queue{
			users: make([]QueueEntry, 0),
		},
	}
}

// AddToQueue adds a user to the matchmaking queue
func (s *Service) AddToQueue(userID string, rating int) error {
	// TODO: Implement adding to queue
	// 1. Check if user is already in queue
	// 2. Add user to queue
	// 3. Try to find a match
	return errors.New("not implemented")
}

// RemoveFromQueue removes a user from the matchmaking queue
func (s *Service) RemoveFromQueue(userID string) error {
	// TODO: Implement removing from queue
	// 1. Find user in queue
	// 2. Remove user from queue
	return errors.New("not implemented")
}

// FindMatch tries to find a match for a user
func (s *Service) FindMatch(userID string) (string, error) {
	// TODO: Implement match finding
	// 1. Find user in queue
	// 2. Find suitable opponent based on rating and time in queue
	// 3. Create a game for the matched users
	// 4. Remove both users from queue
	// 5. Return game ID
	return "", errors.New("not implemented")
}
