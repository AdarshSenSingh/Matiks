// This file provides mock API responses for development
// It simulates the backend API responses

import { User } from '../types/user';
import { Game } from '../types/game';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    rating: 1200
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    rating: 2000
  }
];

// Mock authentication service
export const mockAuthService = {
  // Login
  async login(email: string, password: string): Promise<User> {
    await delay(800); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password') {
      throw new Error('Invalid email or password');
    }
    
    // Store in localStorage to persist the session
    localStorage.setItem('mockUser', JSON.stringify(user));
    
    return user;
  },
  
  // Register
  async register(username: string, email: string, password: string): Promise<User> {
    await delay(1000); // Simulate network delay
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      throw new Error('Email already in use');
    }
    
    if (mockUsers.some(u => u.username === username)) {
      throw new Error('Username already taken');
    }
    
    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      rating: 1000
    };
    
    mockUsers.push(newUser);
    
    // Store in localStorage to persist the session
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    
    return newUser;
  },
  
  // Logout
  async logout(): Promise<void> {
    await delay(500); // Simulate network delay
    localStorage.removeItem('mockUser');
  },
  
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    await delay(300); // Simulate network delay
    
    const storedUser = localStorage.getItem('mockUser');
    if (!storedUser) {
      return null;
    }
    
    return JSON.parse(storedUser) as User;
  }
};

// Mock game data
const mockGames: Game[] = [
  {
    id: '1',
    puzzleSequence: '123456',
    status: 'waiting',
    createdAt: new Date().toISOString(),
    players: [
      {
        userId: '1',
        joinedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    puzzleSequence: '654321',
    status: 'active',
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    players: [
      {
        userId: '1',
        joinedAt: new Date().toISOString()
      },
      {
        userId: '2',
        joinedAt: new Date().toISOString()
      }
    ]
  }
];

// Mock game service
export const mockGameService = {
  // Create a new game
  async createGame(): Promise<Game> {
    await delay(800); // Simulate network delay
    
    const user = await mockAuthService.getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Generate a random puzzle sequence
    const puzzleSequence = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1).join('');
    
    const newGame: Game = {
      id: String(mockGames.length + 1),
      puzzleSequence,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      players: [
        {
          userId: user.id,
          joinedAt: new Date().toISOString()
        }
      ]
    };
    
    mockGames.push(newGame);
    
    return newGame;
  },
  
  // Join a game
  async joinGame(gameId: string): Promise<Game> {
    await delay(800); // Simulate network delay
    
    const user = await mockAuthService.getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'waiting') {
      throw new Error('Game is not in waiting status');
    }
    
    if (game.players.some(p => p.userId === user.id)) {
      throw new Error('You are already in this game');
    }
    
    game.players.push({
      userId: user.id,
      joinedAt: new Date().toISOString()
    });
    
    if (game.players.length >= 2) {
      game.status = 'active';
      game.startedAt = new Date().toISOString();
    }
    
    return game;
  },
  
  // Submit a solution
  async submitSolution(gameId: string, solution: string): Promise<{ isCorrect: boolean, solutionTime: number }> {
    await delay(1000); // Simulate network delay
    
    const user = await mockAuthService.getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }
    
    // Simple validation: solution must contain all digits from the puzzle
    const isCorrect = game.puzzleSequence.split('').every(digit => solution.includes(digit));
    
    // Calculate solution time (random for mock)
    const solutionTime = Math.floor(Math.random() * 30) + 10;
    
    // Update player's solution
    const playerIndex = game.players.findIndex(p => p.userId === user.id);
    if (playerIndex !== -1) {
      game.players[playerIndex].solutionSubmitted = solution;
      game.players[playerIndex].solutionTime = solutionTime;
      game.players[playerIndex].isCorrect = isCorrect;
    }
    
    // Check if all players have submitted solutions
    const allSubmitted = game.players.every(p => p.solutionSubmitted);
    if (allSubmitted) {
      game.status = 'completed';
      game.completedAt = new Date().toISOString();
      
      // Determine winner
      const correctSolutions = game.players.filter(p => p.isCorrect);
      if (correctSolutions.length > 0) {
        // Winner is the player with the fastest correct solution
        const winner = correctSolutions.reduce((fastest, current) => 
          (current.solutionTime || Infinity) < (fastest.solutionTime || Infinity) ? current : fastest
        );
        game.winnerId = winner.userId;
      }
    }
    
    return { isCorrect, solutionTime };
  },
  
  // Get active games
  async getActiveGames(): Promise<Game[]> {
    await delay(800); // Simulate network delay
    
    return mockGames.filter(g => g.status === 'waiting' || g.status === 'active');
  },
  
  // Get a game by ID
  async getGameById(gameId: string): Promise<Game> {
    await delay(500); // Simulate network delay
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    return game;
  }
};

// Export all mock services
export const mockApi = {
  auth: mockAuthService,
  game: mockGameService
};
