# HectoClash Architecture

## System Architecture

HectoClash follows a microservices architecture with the following components:

### Backend Services

1. **User Service**
   - Handles user registration, authentication, and profile management
   - Manages JWT tokens with HTTP-only cookies for secure authentication
   - Stores user data in PostgreSQL

2. **Game Service**
   - Manages game creation, joining, and game state
   - Generates Hectoc puzzles
   - Validates solutions
   - Stores game data in PostgreSQL

3. **Matchmaking Service**
   - Pairs players for duels based on rating and time in queue
   - Uses Redis for efficient queue management

4. **Leaderboard Service**
   - Tracks and displays user rankings
   - Calculates ELO ratings
   - Uses PostgreSQL for persistent storage and Redis for caching

5. **WebSocket Server**
   - Enables real-time communication between players
   - Broadcasts game state updates
   - Manages game rooms

### Frontend Components

1. **Authentication Module**
   - Login, registration, and profile management
   - Secure token handling

2. **Game Lobby**
   - Find opponents
   - View active games
   - Join or create games

3. **Game Interface**
   - Interactive puzzle solving UI
   - Real-time updates of opponent's progress
   - Timer and scoring

4. **Leaderboard View**
   - Display rankings and statistics
   - Filter and search functionality

5. **Spectator Mode**
   - Watch ongoing duels
   - View game history

## Data Flow

1. **User Authentication**
   - User submits credentials
   - Backend validates and issues JWT token in HTTP-only cookie
   - Frontend stores user info in context

2. **Game Creation**
   - User creates a game or joins matchmaking
   - Backend generates a puzzle and creates a game record
   - WebSocket notifies players when game is ready

3. **Game Play**
   - Players receive the same puzzle via WebSocket
   - Players submit solutions
   - Backend validates solutions and updates game state
   - WebSocket broadcasts updates to players

4. **Game Completion**
   - Backend determines winner based on correctness and time
   - Updates user ratings and leaderboard
   - Stores game results in database

## Technology Stack

### Backend

- **Language**: Go (Golang)
- **Web Framework**: Standard library with custom routing
- **Database**: PostgreSQL for persistent data
- **Caching**: Redis for real-time features and caching
- **WebSockets**: Gorilla WebSocket for real-time communication

### Frontend

- **Framework**: React with TypeScript
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **WebSockets**: Native WebSocket API

### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose (development), Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus and Grafana

## Security Considerations

1. **Authentication**
   - JWT tokens stored in HTTP-only cookies
   - CSRF protection
   - Rate limiting for login attempts

2. **Data Validation**
   - Input validation on both client and server
   - Parameterized queries to prevent SQL injection

3. **WebSocket Security**
   - Authentication for WebSocket connections
   - Message validation

4. **API Security**
   - HTTPS for all communications
   - Proper CORS configuration

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless backend services for easy scaling
   - WebSocket connections distributed across multiple instances

2. **Database Scaling**
   - Read replicas for high-traffic queries
   - Sharding for user and game data

3. **Caching Strategy**
   - Redis for frequently accessed data
   - In-memory caching for game state

4. **Load Balancing**
   - Distribute traffic across multiple instances
   - Sticky sessions for WebSocket connections
