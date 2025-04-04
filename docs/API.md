# HectoClash API Documentation

## Authentication

### Register a new user

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "rating": 1000
}
```

### Login a user

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "rating": 1000
}
```

**Note:** Authentication is handled using HTTP-only cookies.

### Logout a user

```
POST /api/auth/logout
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### Get current user

```
GET /api/auth/me
```

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "rating": 1000
}
```

## Game Management

### Create a new game

```
POST /api/games/create
```

**Response:**

```json
{
  "id": "string",
  "puzzle_sequence": "string",
  "status": "waiting",
  "created_at": "string",
  "players": [
    {
      "user_id": "string",
      "joined_at": "string"
    }
  ]
}
```

### Get active games

```
GET /api/games/active
```

**Response:**

```json
[
  {
    "id": "string",
    "puzzle_sequence": "string",
    "status": "waiting",
    "created_at": "string",
    "players": [
      {
        "user_id": "string",
        "joined_at": "string"
      }
    ]
  }
]
```

### Get a game by ID

```
GET /api/games/{id}
```

**Response:**

```json
{
  "id": "string",
  "puzzle_sequence": "string",
  "status": "string",
  "winner_id": "string",
  "created_at": "string",
  "started_at": "string",
  "completed_at": "string",
  "players": [
    {
      "user_id": "string",
      "solution_submitted": "string",
      "solution_time": 0,
      "is_correct": true,
      "joined_at": "string"
    }
  ]
}
```

### Join a game

```
POST /api/games/{id}/join
```

**Response:**

```json
{
  "id": "string",
  "puzzle_sequence": "string",
  "status": "active",
  "created_at": "string",
  "started_at": "string",
  "players": [
    {
      "user_id": "string",
      "joined_at": "string"
    }
  ]
}
```

### Submit a solution

```
POST /api/games/{id}/submit-solution
```

**Request Body:**

```json
{
  "solution": "string"
}
```

**Response:**

```json
{
  "is_correct": true,
  "solution_time": 0
}
```

## Matchmaking

### Join the matchmaking queue

```
POST /api/matchmaking/queue
```

**Response:**

```json
{
  "message": "Added to queue"
}
```

### Leave the matchmaking queue

```
DELETE /api/matchmaking/queue
```

**Response:**

```json
{
  "message": "Removed from queue"
}
```

## Leaderboard

### Get the global leaderboard

```
GET /api/leaderboard
```

**Response:**

```json
[
  {
    "rank": 1,
    "user_id": "string",
    "username": "string",
    "games_played": 0,
    "games_won": 0,
    "win_rate": 0,
    "rating": 0
  }
]
```

### Get a user's stats

```
GET /api/leaderboard/user/{id}
```

**Response:**

```json
{
  "user_id": "string",
  "username": "string",
  "games_played": 0,
  "games_won": 0,
  "win_rate": 0,
  "rating": 0,
  "rank": 0
}
```

## WebSocket API

Connect to the WebSocket server:

```
WebSocket: /ws/game/{id}
```

### Game Events

#### Game Start

```json
{
  "event": "game:start",
  "data": {
    "game_id": "string",
    "puzzle_sequence": "string",
    "players": [
      {
        "user_id": "string",
        "username": "string"
      }
    ],
    "start_time": "string",
    "duration": 60
  }
}
```

#### Game Update

```json
{
  "event": "game:update",
  "data": {
    "game_id": "string",
    "players": [
      {
        "user_id": "string",
        "progress": 50
      }
    ]
  }
}
```

#### Solution Submitted

```json
{
  "event": "game:solution",
  "data": {
    "game_id": "string",
    "user_id": "string",
    "solution": "string",
    "is_correct": true,
    "solution_time": 0
  }
}
```

#### Game End

```json
{
  "event": "game:end",
  "data": {
    "game_id": "string",
    "winner_id": "string",
    "players": [
      {
        "user_id": "string",
        "solution": "string",
        "is_correct": true,
        "solution_time": 0,
        "rating_change": 10
      }
    ],
    "optimal_solution": "string"
  }
}
```

### Matchmaking Events

Connect to the matchmaking WebSocket:

```
WebSocket: /ws/matchmaking
```

#### Match Found

```json
{
  "event": "matchmaking:found",
  "data": {
    "game_id": "string",
    "opponent": {
      "user_id": "string",
      "username": "string",
      "rating": 0
    }
  }
}
```
