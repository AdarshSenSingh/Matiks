package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/hectoclash/internal/practice"
	"github.com/hectoclash/internal/puzzle"
)

// PracticeHandler handles WebSocket messages for practice mode
type PracticeHandler struct {
	hub             *Hub
	practiceService practice.Service
	sessions        map[string]*practice.Session // Map of session ID to session
	sessionsByUser  map[string]string           // Map of user ID to session ID
	mu              sync.RWMutex
}

// NewPracticeHandler creates a new practice handler
func NewPracticeHandler(hub *Hub, practiceService practice.Service) *PracticeHandler {
	handler := &PracticeHandler{
		hub:             hub,
		practiceService: practiceService,
		sessions:        make(map[string]*practice.Session),
		sessionsByUser:  make(map[string]string),
	}

	// Register message handlers
	handler.registerHandlers()

	return handler
}

// registerHandlers registers the practice mode message handlers
func (h *PracticeHandler) registerHandlers() {
	log.Println("Registering practice mode message handlers")

	// Register practice start handler
	h.hub.RegisterMessageHandler(MessageTypePracticeStart, h.handlePracticeStart)
	log.Println("Registered practice_start handler")

	// Register practice end handler
	h.hub.RegisterMessageHandler(MessageTypePracticeEnd, h.handlePracticeEnd)
	log.Println("Registered practice_end handler")

	// Register practice submit solution handler
	h.hub.RegisterMessageHandler(MessageTypePracticeSubmitSolution, h.handlePracticeSubmitSolution)
	log.Println("Registered practice_submit_solution handler")
}

// handlePracticeStart handles a practice start message
func (h *PracticeHandler) handlePracticeStart(client *Client, msg *Message) {
	log.Printf("Handling practice_start message from user %s", client.UserID)

	// Parse the payload
	var payload PracticeStartPayload

	// Log the raw payload for debugging
	log.Printf("Raw payload: %s", string(msg.Payload))

	// Unmarshal the payload
	err := json.Unmarshal(msg.Payload, &payload)
	if err != nil {
		log.Printf("Error parsing practice start payload: %v", err)
		h.sendErrorToClient(client, "Invalid payload")
		return
	}

	log.Printf("Practice start payload: timedMode=%v, startELO=%d", payload.TimedMode, payload.StartELO)

	// Check if user already has an active session
	h.mu.RLock()
	sessionID, exists := h.sessionsByUser[client.UserID]
	h.mu.RUnlock()

	if exists {
		// End the existing session
		h.mu.Lock()
		session := h.sessions[sessionID]
		h.mu.Unlock()

		if session != nil {
			endErr := h.practiceService.EndSession(session)
			if endErr != nil {
				log.Printf("Error ending practice session: %v", endErr)
			}

			h.mu.Lock()
			delete(h.sessions, sessionID)
			delete(h.sessionsByUser, client.UserID)
			h.mu.Unlock()
		}
	}

	// Create a new practice session
	config := practice.SessionConfig{
		UserID:    client.UserID,
		TimedMode: payload.TimedMode,
		StartELO:  payload.StartELO,
	}

	session, err := h.practiceService.CreateSession(config)
	if err != nil {
		log.Printf("Error creating practice session: %v", err)
		h.sendErrorToClient(client, "Failed to create practice session")
		return
	}

	// Store the session
	h.mu.Lock()
	h.sessions[session.ID] = session
	h.sessionsByUser[client.UserID] = session.ID
	h.mu.Unlock()

	// Send the first puzzle to the client
	h.sendNextPuzzle(client, session)
}

// handlePracticeEnd handles a practice end message
func (h *PracticeHandler) handlePracticeEnd(client *Client, msg *Message) {
	// Parse the payload
	var payload PracticeEndPayload
	err := json.Unmarshal(msg.Payload, &payload)
	if err != nil {
		log.Printf("Error parsing practice end payload: %v", err)
		h.sendErrorToClient(client, "Invalid payload")
		return
	}

	// Get the session
	h.mu.RLock()
	session, exists := h.sessions[payload.SessionID]
	h.mu.RUnlock()

	if !exists {
		h.sendErrorToClient(client, "Session not found")
		return
	}

	// Check if the session belongs to the user
	if session.UserID != client.UserID {
		h.sendErrorToClient(client, "Unauthorized")
		return
	}

	// End the session
	err = h.practiceService.EndSession(session)
	if err != nil {
		log.Printf("Error ending practice session: %v", err)
		h.sendErrorToClient(client, "Failed to end practice session")
		return
	}

	// Remove the session
	h.mu.Lock()
	delete(h.sessions, payload.SessionID)
	delete(h.sessionsByUser, client.UserID)
	h.mu.Unlock()

	// Send confirmation to the client
	h.sendPracticeEnd(client, payload.SessionID, payload.Reason)
}

// handlePracticeSubmitSolution handles a practice submit solution message
func (h *PracticeHandler) handlePracticeSubmitSolution(client *Client, msg *Message) {
	// Parse the payload
	var payload PracticeSubmitSolutionPayload
	err := json.Unmarshal(msg.Payload, &payload)
	if err != nil {
		log.Printf("Error parsing practice submit solution payload: %v", err)
		h.sendErrorToClient(client, "Invalid payload")
		return
	}

	// Get the session
	h.mu.RLock()
	session, exists := h.sessions[payload.SessionID]
	h.mu.RUnlock()

	if !exists {
		h.sendErrorToClient(client, "Session not found")
		return
	}

	// Check if the session belongs to the user
	if session.UserID != client.UserID {
		h.sendErrorToClient(client, "Unauthorized")
		return
	}

	// Submit the solution
	validationResult, err := h.practiceService.SubmitSolution(session, payload.Solution)
	if err != nil {
		log.Printf("Error submitting solution: %v", err)
		h.sendErrorToClient(client, "Failed to submit solution")
		return
	}

	// Send the result to the client
	h.sendPracticeResult(client, session, validationResult)

	// If the session is completed or failed, remove it
	if session.Status == "completed" || session.Status == "failed" {
		h.mu.Lock()
		delete(h.sessions, payload.SessionID)
		delete(h.sessionsByUser, client.UserID)
		h.mu.Unlock()
	}
}

// sendNextPuzzle sends the next puzzle to the client
func (h *PracticeHandler) sendNextPuzzle(client *Client, session *practice.Session) {
	// Create the payload
	payload := PracticeNextPuzzlePayload{
		SessionID:     session.ID,
		Puzzle:        session.CurrentPuzzle.Sequence,
		Difficulty:    int(session.CurrentPuzzle.Difficulty),
		CurrentELO:    session.CurrentELO,
		PuzzlesSolved: session.PuzzlesSolved,
	}

	// Add time limit for timed mode
	if session.TimedMode {
		payload.TimeLimit = 60 // 60 seconds per puzzle
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling next puzzle payload: %v", err)
		return
	}

	// Create message
	msg := &Message{
		Type:      MessageTypePracticeNextPuzzle,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Send message to client
	h.hub.sendMessageToClient(client, msg)
}

// sendPracticeResult sends a practice result to the client
func (h *PracticeHandler) sendPracticeResult(client *Client, session *practice.Session, result *puzzle.ValidationResult) {
	// Create the payload
	payload := PracticeResultPayload{
		SessionID:     session.ID,
		IsCorrect:     result.IsCorrect,
		Score:         result.Score,
		RatingChange:  result.RatingChange,
		CurrentELO:    session.CurrentELO,
		PuzzlesSolved: session.PuzzlesSolved,
		Status:        session.Status,
	}

	// Add next puzzle info if available and session is still active
	if session.Status == "active" && session.CurrentPuzzle != nil {
		payload.NextPuzzle = session.CurrentPuzzle.Sequence
		payload.NextDifficulty = int(session.CurrentPuzzle.Difficulty)

		// Add time limit for timed mode
		if session.TimedMode {
			payload.TimeLimit = 60 // 60 seconds per puzzle
		}
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling practice result payload: %v", err)
		return
	}

	// Create message
	msg := &Message{
		Type:      MessageTypePracticeResult,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Send message to client
	h.hub.sendMessageToClient(client, msg)
}

// sendPracticeEnd sends a practice end confirmation to the client
func (h *PracticeHandler) sendPracticeEnd(client *Client, sessionID, reason string) {
	// Create the payload
	payload := PracticeEndPayload{
		SessionID: sessionID,
		Reason:    reason,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling practice end payload: %v", err)
		return
	}

	// Create message
	msg := &Message{
		Type:      MessageTypePracticeEnd,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Send message to client
	h.hub.sendMessageToClient(client, msg)
}

// sendErrorToClient sends an error message to the client
func (h *PracticeHandler) sendErrorToClient(client *Client, message string) {
	// Create the payload
	payload := ErrorPayload{
		Code:    400,
		Message: message,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling error payload: %v", err)
		return
	}

	// Create message
	msg := &Message{
		Type:      MessageTypeError,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Send message to client
	h.hub.sendMessageToClient(client, msg)
}

// CleanupInactiveSessions removes inactive sessions
func (h *PracticeHandler) CleanupInactiveSessions() {
	h.mu.Lock()
	defer h.mu.Unlock()

	now := time.Now()
	for id, session := range h.sessions {
		// Remove sessions that have been inactive for more than 30 minutes
		if now.Sub(session.LastUpdatedAt) > 30*time.Minute {
			// End the session
			err := h.practiceService.EndSession(session)
			if err != nil {
				log.Printf("Error ending inactive practice session: %v", err)
			}

			// Remove the session
			delete(h.sessions, id)
			delete(h.sessionsByUser, session.UserID)
		}
	}
}
