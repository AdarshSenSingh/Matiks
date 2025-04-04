package websocket

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Maximum message size allowed from peer
const (
	maxMessageSize = 10240 // 10KB
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	closeGracePeriod = 10 * time.Second
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for now - in production, this should be restricted
	CheckOrigin: func(r *http.Request) bool { return true },
}

// MessageType represents the type of WebSocket message
type MessageType string

const (
	// Message types
	MessageTypeGameState     MessageType = "game_state"
	MessageTypePlayerJoined  MessageType = "player_joined"
	MessageTypePlayerLeft    MessageType = "player_left"
	MessageTypeGameStart     MessageType = "game_start"
	MessageTypeGameEnd       MessageType = "game_end"
	MessageTypePlayerProgress MessageType = "player_progress"
	MessageTypeSolutionSubmitted MessageType = "solution_submitted"
	MessageTypeMatchmakingStatus MessageType = "matchmaking_status"
	MessageTypeMatchFound    MessageType = "match_found"
	MessageTypeError         MessageType = "error"
	MessageTypePing          MessageType = "ping"
	MessageTypePong          MessageType = "pong"
	MessageTypeJoinQueue     MessageType = "join_queue"
	MessageTypeLeaveQueue    MessageType = "leave_queue"

	// Practice mode message types
	MessageTypePracticeStart   MessageType = "practice_start"
	MessageTypePracticeEnd     MessageType = "practice_end"
	MessageTypePracticeNextPuzzle MessageType = "practice_next_puzzle"
	MessageTypePracticeSubmitSolution MessageType = "practice_submit_solution"
	MessageTypePracticeResult  MessageType = "practice_result"
)

// Message represents a WebSocket message
type Message struct {
	Type      MessageType     `json:"type"`
	GameID    string          `json:"game_id,omitempty"`
	UserID    string          `json:"user_id,omitempty"`
	Timestamp int64           `json:"timestamp"`
	Payload   json.RawMessage `json:"payload,omitempty"`
}

// GameStatePayload represents the payload for a game state message
type GameStatePayload struct {
	Status    string           `json:"status"`
	Players   []PlayerPayload  `json:"players"`
	StartedAt *int64           `json:"started_at,omitempty"`
	Puzzle    string           `json:"puzzle,omitempty"`
}

// PlayerPayload represents a player in the game state
type PlayerPayload struct {
	UserID    string  `json:"user_id"`
	Username  string  `json:"username"`
	Progress  float64 `json:"progress"`
	IsCorrect *bool   `json:"is_correct,omitempty"`
	Score     *int    `json:"score,omitempty"`
}

// PlayerProgressPayload represents the payload for a player progress message
type PlayerProgressPayload struct {
	Progress float64 `json:"progress"`
}

// SolutionSubmittedPayload represents the payload for a solution submitted message
type SolutionSubmittedPayload struct {
	IsCorrect bool   `json:"is_correct"`
	Score     int    `json:"score,omitempty"`
	Solution  string `json:"solution"`
}

// MatchmakingStatusPayload represents the payload for a matchmaking status message
type MatchmakingStatusPayload struct {
	Status    string  `json:"status"`
	WaitTime  float64 `json:"wait_time"`
	QueueSize int     `json:"queue_size"`
}

// MatchFoundPayload represents the payload for a match found message
type MatchFoundPayload struct {
	GameID    string `json:"game_id"`
	GameType  string `json:"game_type"`
	Opponent  PlayerPayload `json:"opponent"`
	IsRanked  bool   `json:"is_ranked"`
}

// ErrorPayload represents the payload for an error message
type ErrorPayload struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// JoinQueuePayload represents the payload for a join queue message
type JoinQueuePayload struct {
	GameType string `json:"game_type"`
	Ranked   bool   `json:"ranked"`
}

// LeaveQueuePayload represents the payload for a leave queue message
type LeaveQueuePayload struct {
	GameType string `json:"game_type,omitempty"`
}

// PracticeStartPayload represents the payload for starting a practice session
type PracticeStartPayload struct {
	TimedMode bool `json:"timed_mode"`
	StartELO  int  `json:"start_elo,omitempty"`
}

// PracticeEndPayload represents the payload for ending a practice session
type PracticeEndPayload struct {
	SessionID string `json:"session_id"`
	Reason    string `json:"reason,omitempty"`
}

// PracticeNextPuzzlePayload represents the payload for a new puzzle in practice mode
type PracticeNextPuzzlePayload struct {
	SessionID     string `json:"session_id"`
	Puzzle        string `json:"puzzle"`
	Difficulty    int    `json:"difficulty"`
	CurrentELO    int    `json:"current_elo"`
	PuzzlesSolved int    `json:"puzzles_solved"`
	TimeLimit     int    `json:"time_limit,omitempty"` // in seconds, only for timed mode
}

// PracticeSubmitSolutionPayload represents the payload for submitting a solution in practice mode
type PracticeSubmitSolutionPayload struct {
	SessionID string `json:"session_id"`
	Solution  string `json:"solution"`
}

// PracticeResultPayload represents the payload for a practice result
type PracticeResultPayload struct {
	SessionID     string `json:"session_id"`
	IsCorrect     bool   `json:"is_correct"`
	Score         int    `json:"score,omitempty"`
	RatingChange  int    `json:"rating_change,omitempty"`
	CurrentELO    int    `json:"current_elo"`
	PuzzlesSolved int    `json:"puzzles_solved"`
	NextPuzzle    string `json:"next_puzzle,omitempty"`
	NextDifficulty int   `json:"next_difficulty,omitempty"`
	TimeLimit     int    `json:"time_limit,omitempty"` // in seconds, only for timed mode
	Status        string `json:"status"` // "active", "completed", "failed"
}

// MatchmakingService defines the interface for matchmaking operations
type MatchmakingService interface {
	JoinQueue(userID, gameType string, ranked bool) error
	LeaveQueue(userID string) error
	GetQueueStatus(userID string) (bool, time.Duration, string, error)
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients
	clients map[string]*Client

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Game rooms
	gameRooms map[string]map[*Client]bool

	// Mutex for thread-safe operations
	mu sync.RWMutex

	// Message handlers
	messageHandlers map[MessageType]func(*Client, *Message)

	// Matchmaking service
	matchmakingService MatchmakingService
}

// NewHub creates a new WebSocket hub
func NewHub(matchmakingService MatchmakingService) *Hub {
	hub := &Hub{
		clients:            make(map[string]*Client),
		register:           make(chan *Client),
		unregister:         make(chan *Client),
		gameRooms:          make(map[string]map[*Client]bool),
		messageHandlers:    make(map[MessageType]func(*Client, *Message)),
		matchmakingService: matchmakingService,
	}

	// Register default message handlers
	hub.registerDefaultHandlers()

	return hub
}

// RegisterMessageHandler registers a handler for a specific message type
func (h *Hub) RegisterMessageHandler(messageType MessageType, handler func(*Client, *Message)) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.messageHandlers[messageType] = handler
}

// registerDefaultHandlers registers the default message handlers
func (h *Hub) registerDefaultHandlers() {
	// Register ping handler
	h.RegisterMessageHandler(MessageTypePing, func(c *Client, msg *Message) {
		// Send pong message
		pongMsg := &Message{
			Type:      MessageTypePong,
			Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		}
		h.sendMessageToClient(c, pongMsg)
	})

	// Register player progress handler
	h.RegisterMessageHandler(MessageTypePlayerProgress, func(c *Client, msg *Message) {
		// Broadcast progress to all clients in the game room
		if msg.GameID != "" {
			h.BroadcastToGame(msg.GameID, messageToBytes(msg))
		}
	})

	// Register solution submitted handler
	h.RegisterMessageHandler(MessageTypeSolutionSubmitted, func(c *Client, msg *Message) {
		// Broadcast solution to all clients in the game room
		if msg.GameID != "" {
			h.BroadcastToGame(msg.GameID, messageToBytes(msg))
		}
	})

	// Register join queue handler
	h.RegisterMessageHandler(MessageTypeJoinQueue, func(c *Client, msg *Message) {
		// Parse the payload
		var payload JoinQueuePayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			log.Printf("Error parsing join queue payload: %v", err)
			return
		}

		// Call the matchmaking service to join the queue
		log.Printf("User %s joining queue for game type %s (ranked: %v)", c.UserID, payload.GameType, payload.Ranked)

		// Get the matchmaking service from the context
		matchmakingService := h.matchmakingService
		if matchmakingService == nil {
			log.Printf("Matchmaking service not available")
			return
		}

		// Join the queue
		err := matchmakingService.JoinQueue(c.UserID, payload.GameType, payload.Ranked)
		if err != nil {
			log.Printf("Error joining queue: %v", err)

			// Send error message to client
			errorPayload := struct {
				Code    int    `json:"code"`
				Message string `json:"message"`
			}{
				Code:    400,
				Message: fmt.Sprintf("Failed to join queue: %v", err),
			}

			payloadBytes, _ := json.Marshal(errorPayload)

			errorMsg := &Message{
				Type:      MessageTypeError,
				UserID:    c.UserID,
				Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
				Payload:   payloadBytes,
			}
			h.sendMessageToClient(c, errorMsg)
			return
		}

		// Send a matchmaking status update
		statusMsg := &Message{
			Type:      MessageTypeMatchmakingStatus,
			UserID:    c.UserID,
			Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
			Payload:   []byte(`{"status":"queued","time_in_queue":0}`),
		}
		h.sendMessageToClient(c, statusMsg)
	})

	// Register leave queue handler
	h.RegisterMessageHandler(MessageTypeLeaveQueue, func(c *Client, msg *Message) {
		// Parse the payload
		var payload LeaveQueuePayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			log.Printf("Error parsing leave queue payload: %v", err)
			return
		}

		// Call the matchmaking service to leave the queue
		log.Printf("User %s leaving queue", c.UserID)

		// Get the matchmaking service from the context
		matchmakingService := h.matchmakingService
		if matchmakingService == nil {
			log.Printf("Matchmaking service not available")
			return
		}

		// Leave the queue
		err := matchmakingService.LeaveQueue(c.UserID)
		if err != nil {
			log.Printf("Error leaving queue: %v", err)

			// Send error message to client
			errorPayload := struct {
				Code    int    `json:"code"`
				Message string `json:"message"`
			}{
				Code:    400,
				Message: fmt.Sprintf("Failed to leave queue: %v", err),
			}

			payloadBytes, _ := json.Marshal(errorPayload)

			errorMsg := &Message{
				Type:      MessageTypeError,
				UserID:    c.UserID,
				Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
				Payload:   payloadBytes,
			}
			h.sendMessageToClient(c, errorMsg)
			return
		}

		// Send a matchmaking status update
		statusMsg := &Message{
			Type:      MessageTypeMatchmakingStatus,
			UserID:    c.UserID,
			Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
			Payload:   []byte(`{"status":"left_queue"}`),
		}
		h.sendMessageToClient(c, statusMsg)
	})
}

// Helper function to convert a message to JSON bytes
func messageToBytes(msg *Message) []byte {
	bytes, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return nil
	}
	return bytes
}

// Helper function to parse a message from JSON bytes
func parseMessage(data []byte) (*Message, error) {
	var msg Message
	err := json.Unmarshal(data, &msg)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

// Helper function to get the keys of the message handlers map
func getMessageHandlerKeys(handlers map[MessageType]func(*Client, *Message)) []string {
	keys := make([]string, 0, len(handlers))
	for k := range handlers {
		keys = append(keys, string(k))
	}
	return keys
}

// processMessage processes an incoming message
func (h *Hub) processMessage(client *Client, data []byte) {
	// Parse the message
	msg, err := parseMessage(data)
	if err != nil {
		log.Printf("Error parsing message: %v", err)
		return
	}

	// Set the user ID if not set
	if msg.UserID == "" {
		msg.UserID = client.UserID
	}

	// Set the timestamp if not set
	if msg.Timestamp == 0 {
		msg.Timestamp = time.Now().UnixNano() / int64(time.Millisecond)
	}

	// Log the message
	log.Printf("Processing message: type=%s, userID=%s", msg.Type, msg.UserID)

	// Handle the message based on its type
	h.mu.RLock()
	log.Printf("Registered message handlers: %v", getMessageHandlerKeys(h.messageHandlers))
	handler, ok := h.messageHandlers[msg.Type]
	h.mu.RUnlock()

	if ok {
		log.Printf("Found handler for message type: %s", msg.Type)
		handler(client, msg)
	} else {
		log.Printf("No handler for message type: %s", msg.Type)
	}
}

// sendMessageToClient sends a message to a specific client
func (h *Hub) sendMessageToClient(client *Client, msg *Message) {
	// Set the timestamp if not set
	if msg.Timestamp == 0 {
		msg.Timestamp = time.Now().UnixNano() / int64(time.Millisecond)
	}

	// Convert the message to JSON
	data := messageToBytes(msg)
	if data == nil {
		return
	}

	// Send the message to the client
	select {
	case client.Send <- data:
		// Message sent successfully
	default:
		// Client send buffer is full, remove client
		h.unregister <- client
	}
}

// SetMatchmakingService sets the matchmaking service for the hub
func (h *Hub) SetMatchmakingService(service MatchmakingService) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.matchmakingService = service
}

// Run starts the WebSocket hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()

			// Send a welcome message to the client
			welcomeMsg := &Message{
				Type:      MessageTypeGameState,
				UserID:    client.UserID,
				Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
			}
			h.sendMessageToClient(client, welcomeMsg)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				// Remove client from all game rooms
				for gameID, clients := range h.gameRooms {
					if _, ok := clients[client]; ok {
						delete(h.gameRooms[gameID], client)

						// Notify other clients in the room that this client has left
						leftMsg := &Message{
							Type:      MessageTypePlayerLeft,
							GameID:    gameID,
							UserID:    client.UserID,
							Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
						}
						h.BroadcastToGame(gameID, messageToBytes(leftMsg))

						// Remove empty game rooms
						if len(h.gameRooms[gameID]) == 0 {
							delete(h.gameRooms, gameID)
						}
					}
				}

				// Close the client's send channel and remove from clients map
				close(client.Send)
				delete(h.clients, client.ID)
			}
			h.mu.Unlock()
		}
	}
}

// JoinGameRoom adds a client to a game room
func (h *Hub) JoinGameRoom(gameID string, client *Client) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Create game room if it doesn't exist
	if _, ok := h.gameRooms[gameID]; !ok {
		h.gameRooms[gameID] = make(map[*Client]bool)
	}

	// Add client to game room
	h.gameRooms[gameID][client] = true

	// Notify other clients in the room that a new client has joined
	joinedMsg := &Message{
		Type:      MessageTypePlayerJoined,
		GameID:    gameID,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}

	// Convert the message to JSON
	data := messageToBytes(joinedMsg)
	if data != nil {
		// Send to all clients in the room except the one who joined
		for c := range h.gameRooms[gameID] {
			if c.ID != client.ID {
				select {
				case c.Send <- data:
					// Message sent successfully
				default:
					// Client send buffer is full, remove client
					delete(h.gameRooms[gameID], c)
					if len(h.gameRooms[gameID]) == 0 {
						delete(h.gameRooms, gameID)
					}
				}
			}
		}
	}

	return nil
}

// LeaveGameRoom removes a client from a game room
func (h *Hub) LeaveGameRoom(gameID string, client *Client) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Check if game room exists
	if _, ok := h.gameRooms[gameID]; !ok {
		return errors.New("game room not found")
	}

	// Check if client is in the game room
	if _, ok := h.gameRooms[gameID][client]; !ok {
		return errors.New("client not in game room")
	}

	// Remove client from game room
	delete(h.gameRooms[gameID], client)

	// Notify other clients in the room that this client has left
	leftMsg := &Message{
		Type:      MessageTypePlayerLeft,
		GameID:    gameID,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}

	// Convert the message to JSON
	data := messageToBytes(leftMsg)
	if data != nil {
		// Send to all clients in the room
		for c := range h.gameRooms[gameID] {
			select {
			case c.Send <- data:
				// Message sent successfully
			default:
				// Client send buffer is full, remove client
				delete(h.gameRooms[gameID], c)
			}
		}
	}

	// Remove game room if empty
	if len(h.gameRooms[gameID]) == 0 {
		delete(h.gameRooms, gameID)
	}

	return nil
}

// BroadcastToGame sends a message to all clients in a game room
func (h *Hub) BroadcastToGame(gameID string, message []byte) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Check if game room exists
	if _, ok := h.gameRooms[gameID]; !ok {
		return errors.New("game room not found")
	}

	// Send message to all clients in game room
	for client := range h.gameRooms[gameID] {
		select {
		case client.Send <- message:
			// Message sent successfully
		default:
			// Client send buffer is full, remove client
			close(client.Send)
			delete(h.gameRooms[gameID], client)
			delete(h.clients, client.ID)
		}
	}

	return nil
}

// BroadcastGameState sends the current game state to all clients in a game room
func (h *Hub) BroadcastGameState(gameID string, status string, players []PlayerPayload, startedAt *int64, puzzle string) error {
	// Create game state message
	payload := GameStatePayload{
		Status:    status,
		Players:   players,
		StartedAt: startedAt,
		Puzzle:    puzzle,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &Message{
		Type:      MessageTypeGameState,
		GameID:    gameID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Broadcast message
	return h.BroadcastToGame(gameID, messageToBytes(msg))
}

// BroadcastGameStart sends a game start message to all clients in a game room
func (h *Hub) BroadcastGameStart(gameID string, startTime int64, puzzle string) error {
	// Create game start message
	payload := GameStatePayload{
		Status:    "active",
		StartedAt: &startTime,
		Puzzle:    puzzle,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &Message{
		Type:      MessageTypeGameStart,
		GameID:    gameID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Broadcast message
	return h.BroadcastToGame(gameID, messageToBytes(msg))
}

// BroadcastGameEnd sends a game end message to all clients in a game room
func (h *Hub) BroadcastGameEnd(gameID string, winnerID string, players []PlayerPayload) error {
	// Create game end message
	payload := struct {
		WinnerID string          `json:"winner_id"`
		Players  []PlayerPayload `json:"players"`
	}{
		WinnerID: winnerID,
		Players:  players,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &Message{
		Type:      MessageTypeGameEnd,
		GameID:    gameID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Broadcast message
	return h.BroadcastToGame(gameID, messageToBytes(msg))
}

// SendMatchmakingStatus sends a matchmaking status message to a specific client
func (h *Hub) SendMatchmakingStatus(client *Client, status string, waitTime float64, queueSize int) error {
	// Create matchmaking status message
	payload := MatchmakingStatusPayload{
		Status:    status,
		WaitTime:  waitTime,
		QueueSize: queueSize,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &Message{
		Type:      MessageTypeMatchmakingStatus,
		UserID:    client.UserID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Send message to client
	msgBytes := messageToBytes(msg)
	if msgBytes == nil {
		return errors.New("failed to convert message to bytes")
	}

	select {
	case client.Send <- msgBytes:
		return nil
	default:
		return errors.New("client send buffer full")
	}
}

// GetClientByUserID gets a client by user ID
func (h *Hub) GetClientByUserID(userID string) *Client {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		if client.UserID == userID {
			return client
		}
	}

	return nil
}

// SendMatchFound sends a match found message to a specific client
func (h *Hub) SendMatchFound(client *Client, gameID string, gameType string, opponent PlayerPayload, isRanked bool) error {
	// Create match found message
	payload := MatchFoundPayload{
		GameID:   gameID,
		GameType: gameType,
		Opponent: opponent,
		IsRanked: isRanked,
	}

	// Convert payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create message
	msg := &Message{
		Type:      MessageTypeMatchFound,
		UserID:    client.UserID,
		GameID:    gameID,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
		Payload:   payloadBytes,
	}

	// Send message to client
	msgBytes := messageToBytes(msg)
	if msgBytes == nil {
		return errors.New("failed to convert message to bytes")
	}

	select {
	case client.Send <- msgBytes:
		return nil
	default:
		return errors.New("client send buffer full")
	}
}
