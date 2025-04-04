package websocket

import (
	"errors"
	"sync"
)

// Client represents a WebSocket client
type Client struct {
	ID     string
	UserID string
	// TODO: Add WebSocket connection
	Send   chan []byte
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
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		gameRooms:  make(map[string]map[*Client]bool),
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
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
				// Remove client from game rooms
				for gameID, clients := range h.gameRooms {
					if _, ok := clients[client]; ok {
						delete(h.gameRooms[gameID], client)
					}
				}
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

	// Remove client from game room
	delete(h.gameRooms[gameID], client)

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
		default:
			// Client send buffer is full, remove client
			close(client.Send)
			delete(h.gameRooms[gameID], client)
			delete(h.clients, client.ID)
		}
	}

	return nil
}
