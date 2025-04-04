package websocket

import (
	"bytes"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Client represents a WebSocket client
type Client struct {
	ID     string
	UserID string
	hub    *Hub
	conn   *websocket.Conn
	Send   chan []byte
	rooms  map[string]bool // Rooms the client is in
	mu     sync.Mutex      // Mutex for thread-safe operations
}

// NewClient creates a new WebSocket client
func NewClient(id, userID string, hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		ID:     id,
		UserID: userID,
		hub:    hub,
		conn:   conn,
		Send:   make(chan []byte, 256),
		rooms:  make(map[string]bool),
	}
}

// ReadPump pumps messages from the WebSocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, []byte{'\n'}, []byte{' '}, -1))

		// Process the message
		c.hub.processMessage(c, message)
	}
}

// WritePump pumps messages from the hub to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current websocket message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// JoinRoom adds the client to a room
func (c *Client) JoinRoom(roomID string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.rooms[roomID] = true
	c.hub.JoinGameRoom(roomID, c)
}

// LeaveRoom removes the client from a room
func (c *Client) LeaveRoom(roomID string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.rooms, roomID)
	c.hub.LeaveGameRoom(roomID, c)
}

// InRoom checks if the client is in a room
func (c *Client) InRoom(roomID string) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	_, ok := c.rooms[roomID]
	return ok
}

// GetRooms returns all rooms the client is in
func (c *Client) GetRooms() []string {
	c.mu.Lock()
	defer c.mu.Unlock()

	rooms := make([]string, 0, len(c.rooms))
	for room := range c.rooms {
		rooms = append(rooms, room)
	}

	return rooms
}
