# HectoClash Backend

This is the backend server for HectoClash, a real-time competitive mental math game based on the Hectoc format.

## Technologies Used

- Go (Golang)
- Gin Web Framework
- GORM (ORM)
- PostgreSQL
- JWT Authentication
- WebSockets for real-time communication

## Prerequisites

- Go 1.21 or higher
- PostgreSQL
- Make (optional, for using the Makefile)

## Getting Started

1. Clone the repository
2. Set up the environment variables (see `.env.example`)
3. Initialize the database:

```bash
make init-db
```

4. Install dependencies:

```bash
make deps
```

5. Run the server:

```bash
make run
```

For development with hot reload:

```bash
# Install Air first
go install github.com/cosmtrek/air@latest

# Run with hot reload
make dev
```

## Project Structure

```
backend/
├── cmd/                  # Application entry points
│   └── server/           # Main server application
├── internal/             # Private application code
│   ├── config/           # Configuration
│   ├── handlers/         # HTTP handlers
│   ├── middleware/       # HTTP middleware
│   ├── models/           # Data models
│   ├── repository/       # Data access layer
│   ├── routes/           # Route definitions
│   └── services/         # Business logic
├── pkg/                  # Public libraries
├── .env                  # Environment variables
├── .air.toml             # Air configuration for hot reload
├── go.mod                # Go module definition
├── go.sum                # Go module checksums
└── Makefile              # Build and run commands
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Game

- `POST /api/games` - Create a new game
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get a game by ID
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/submit` - Submit a solution

### User

- `GET /api/users/:id` - Get a user by ID
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/leaderboard` - Get the leaderboard

## WebSocket API

Connect to `/ws` to receive real-time updates about games.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
