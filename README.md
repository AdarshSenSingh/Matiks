# HectoClash

HectoClash is a real-time competitive mental math game based on the Hectoc format. Players compete in head-to-head duels, solving Hectoc puzzles under time constraints.

## What is Hectoc?

Hectoc is a mental calculation game developed by Yusnier Viera in the 2010s. In this game, players are given a sequence of six digits (each ranging from 1 to 9) and must insert mathematical operations - such as addition, subtraction, multiplication, division, exponentiation, and parentheses - to make the expression equal to 100. The digits must be used in the given order without rearrangement.

Example: Given the sequence "123456," a possible solution is: 1 + (2 + 3 + 4) × (5 + 6) = 100.

## Features

- **Real-Time Duels**: Challenge other players in live, timed Hectoc battles.
- **Dynamic Puzzle Generation**: Each game features randomly generated six-digit sequences for varied and unpredictable challenges.
- **Leaderboards & Rankings**: Compete for the top spot on our global leaderboards and track your progress over time.
- **Spectator Mode**: Watch live duels, fostering a community around the game.
- **Educational Insights**: Receive post-game analyses, highlighting optimal solutions and common mistakes to aid learning.

## Tech Stack

- **Backend**: Go (Golang)
- **Frontend**: React with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Caching**: Redis
- **Real-time Communication**: WebSockets

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

## Project Structure

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

## Documentation

- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Detailed Documentation](docs/README.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
