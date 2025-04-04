import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PuzzleDisplay from '../components/PuzzleDisplay';
import SolutionInput from '../components/SolutionInput';
import ProgressIndicator from '../components/ProgressIndicator';
import GameResults from '../components/GameResults';
import { motion } from 'framer-motion';

interface Player {
  id: string;
  username: string;
  progress: number;
  isCorrect?: boolean;
  score?: number;
  solutionTime?: number;
  solution?: string;
  isSelf?: boolean;
}

interface GameState {
  id: string;
  status: 'waiting' | 'active' | 'completed';
  sequence: string;
  target: number;
  startTime?: number;
  endTime?: number;
  players: Player[];
}

const PracticeGame: React.FC = () => {
  const navigate = useNavigate();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    id: 'practice-123',
    status: 'waiting',
    sequence: '123456',
    target: 100,
    players: [
      { id: 'user-1', username: 'You', progress: 0, isSelf: true },
    ],
  });
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes
  
  // Handle solution submission
  const handleSubmitSolution = useCallback((solution: string) => {
    // For demo purposes, update the game state locally
    setGameState(prev => ({
      ...prev,
      status: 'completed',
      players: prev.players.map(player => 
        player.isSelf 
          ? { 
              ...player, 
              progress: 1, 
              isCorrect: true, 
              score: 100, 
              solutionTime: 300 - timeRemaining,
              solution,
            }
          : player
      ),
    }));
  }, [timeRemaining]);
  
  // Start the game immediately
  useEffect(() => {
    if (gameState.status === 'waiting') {
      setGameState(prev => ({
        ...prev,
        status: 'active',
        startTime: Date.now(),
      }));
    }
  }, [gameState.status]);
  
  // Update timer when game is active
  useEffect(() => {
    if (gameState.status === 'active') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            // Time's up - mark as incomplete
            setGameState(prevState => ({
              ...prevState,
              status: 'completed',
              players: prevState.players.map(player => ({
                ...player,
                progress: 1,
                isCorrect: false,
                score: 0,
                solutionTime: 300,
              })),
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState.status]);
  
  // Handle play again
  const handlePlayAgain = () => {
    // Reset the game
    setGameState({
      id: 'practice-' + Math.random().toString(36).substring(2, 9),
      status: 'waiting',
      sequence: Math.random().toString().substring(2, 8),
      target: 100,
      players: [
        { id: 'user-1', username: 'You', progress: 0, isSelf: true },
      ],
    });
    setTimeRemaining(300);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Practice Mode
      </h1>
      
      <PuzzleDisplay 
        sequence={gameState.sequence} 
        target={gameState.target}
        timeRemaining={timeRemaining}
        isActive={gameState.status === 'active'}
      />
      
      <ProgressIndicator 
        players={gameState.players} 
        gameMode="practice"
      />
      
      {gameState.status === 'active' && (
        <SolutionInput 
          onSubmit={handleSubmitSolution} 
          isActive={gameState.status === 'active'}
          sequence={gameState.sequence}
        />
      )}
      
      {gameState.status === 'completed' && (
        <GameResults 
          players={gameState.players}
          gameMode="practice"
          sequence={gameState.sequence}
          target={gameState.target}
          onPlayAgain={handlePlayAgain}
        />
      )}
      
      <div className="mt-8 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold shadow-lg"
          onClick={() => navigate('/game')}
        >
          Back to Game Selection
        </motion.button>
      </div>
    </div>
  );
};

export default PracticeGame;
