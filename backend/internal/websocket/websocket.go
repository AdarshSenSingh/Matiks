package websocket

import (
	"encoding/json"
	"errors"
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
	MessageTypeError         MessageType = "error"
	MessageTypePing          MessageType = "ping"
	MessageTypePong          MessageType = "pong"
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

// ErrorPayload represents the payload for an error message
type ErrorPayload struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
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
	mu sync.Mutex

	// Message handlers
	messageHandlers map[MessageType]func(*Client, *Message)
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	hub := &Hub{
		clients:         make(map[string]*Client),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
		gameRooms:       make(map[string]map[*Client]bool),
		messageHandlers: make(map[MessageType]func(*Client, *Message)),
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

	// Handle the message based on its type
	h.mu.Lock()
	handler, ok := h.messageHandlers[msg.Type]
	h.mu.Unlock()

	if ok {
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
