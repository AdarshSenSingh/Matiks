# HectoClash Documentation

## Overview

HectoClash is a real-time competitive mental math game based on the Hectoc format. Players compete in head-to-head duels, solving Hectoc puzzles under time constraints.

## What is Hectoc?

Hectoc is a mental calculation game developed by Yusnier Viera in the 2010s. In this game, players are given a sequence of six digits (each ranging from 1 to 9) and must insert mathematical operations - such as addition, subtraction, multiplication, division, exponentiation, and parentheses - to make the expression equal to 100. The digits must be used in the given order without rearrangement.

Example: Given the sequence "123456," a possible solution is: 1 + (2 + 3 + 4) × (5 + 6) = 100.

## Project Structure

The project is organized as follows:

```
HectoClash/
├── backend/                 # Go backend
│   ├── cmd/                 # Application entry points
│   ├── internal/            # Internal packages
│   └── pkg/                 # Reusable packages
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   └── src/                 # Source code
├── docker/                  # Docker configuration
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- Go 1.22 or higher
- Node.js 18 or higher
- Docker and Docker Compose (optional)

### Running Locally

#### Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running with Docker

```bash
docker-compose up
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user

### Game

- `POST /api/games/create` - Create a new game
- `GET /api/games/active` - Get active games
- `GET /api/games/{id}` - Get a game by ID
- `POST /api/games/{id}/join` - Join a game
- `POST /api/games/{id}/submit-solution` - Submit a solution

### Matchmaking

- `POST /api/matchmaking/queue` - Join the matchmaking queue
- `DELETE /api/matchmaking/queue` - Leave the matchmaking queue

### Leaderboard

- `GET /api/leaderboard` - Get the global leaderboard
- `GET /api/leaderboard/user/{id}` - Get a user's stats

## WebSocket API

### Game Events

- `game:start` - Game has started
- `game:update` - Game state has changed
- `game:solution` - Player submitted a solution
- `game:end` - Game has ended

### Matchmaking Events

- `matchmaking:found` - Match found

## Database Schema

### Users Table

- `user_id` (PK)
- `username`
- `email`
- `password_hash`
- `created_at`
- `last_login`
- `rating/elo`

### Games Table

- `game_id` (PK)
- `puzzle_sequence`
- `status` (active, completed, abandoned)
- `created_at`
- `completed_at`
- `winner_id` (FK to Users)

### GamePlayers Table

- `game_player_id` (PK)
- `game_id` (FK to Games)
- `user_id` (FK to Users)
- `solution_submitted`
- `solution_time`
- `is_correct`

### Leaderboard Table

- `user_id` (FK to Users)
- `games_played`
- `games_won`
- `average_solve_time`
- `rating/elo`
