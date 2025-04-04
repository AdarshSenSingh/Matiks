export type GameStatus = 'waiting' | 'active' | 'completed' | 'abandoned';

export interface Player {
  userId: string;
  solutionSubmitted?: string;
  solutionTime?: number; // in seconds
  isCorrect?: boolean;
  joinedAt: string;
}

export interface Game {
  id: string;
  puzzleSequence: string; // The 6-digit sequence
  status: GameStatus;
  winnerId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  players: Player[];
}

export interface Solution {
  expression: string;
  isCorrect: boolean;
}
