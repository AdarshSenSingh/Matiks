# WebSocket Implementation for HectoClash

This document provides instructions for implementing WebSocket communication in the HectoClash application.

## Files Created/Modified

1. `internal/websocket/client.go` - WebSocket client implementation
2. `internal/websocket/websocket.go` - WebSocket hub and message handling
3. `internal/websocket/handler.go` - HTTP handlers for WebSocket connections
4. `internal/game/event_service.go` - Game event service for WebSocket notifications
5. `internal/routes/websocket.go` - WebSocket route registration

## Main File Update

Replace the content of `cmd/server/main.go` with the content from `main.go.new` to enable WebSocket functionality.

```bash
mv main.go.new cmd/server/main.go
```

## Implementation Details

### WebSocket Hub

The WebSocket hub manages all active WebSocket connections and handles message broadcasting. It implements:

- Client registration and unregistration
- Game room management
- Message broadcasting to specific rooms
- Reconnection handling

### Game Event Service

The game event service integrates with the game service to send real-time updates to clients:

- Game creation notifications
- Player join notifications
- Game start/end notifications
- Player progress updates
- Solution submission notifications

### Message Types

The following message types are supported:

- `game_state` - Current game state
- `player_joined` - Player joined notification
- `player_left` - Player left notification
- `game_start` - Game start notification
- `game_end` - Game end notification
- `player_progress` - Player progress update
- `solution_submitted` - Solution submission notification
- `error` - Error notification
- `ping`/`pong` - Connection health checks

## WebSocket Routes

- `/ws/connect` - Public WebSocket connection
- `/ws/auth` - Authenticated WebSocket connection
- `/ws/game/:id` - Game-specific WebSocket connection
- `/ws/reconnect` - Reconnection endpoint for dropped connections

## Testing WebSocket Connections

You can test WebSocket connections using tools like [websocat](https://github.com/vi/websocat) or browser-based tools:

```bash
# Connect to a game
websocat ws://localhost:8080/ws/game/123 -H "Authorization: Bearer YOUR_TOKEN"

# Send a ping message
echo '{"type":"ping","timestamp":1617235678901}' | websocat ws://localhost:8080/ws/auth -H "Authorization: Bearer YOUR_TOKEN"
```
