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

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  solutionTime: number;
  solution: string;
}

interface GameState {
  id: string;
  status: 'waiting' | 'active' | 'completed';
  sequence: string;
  target: number;
  startTime?: number;
  endTime?: number;
  players: Player[];
  leaderboard?: LeaderboardEntry[];
  date: string;
}

const DailyChallenge: React.FC = () => {
  const navigate = useNavigate();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    id: 'daily-' + new Date().toISOString().split('T')[0],
    status: 'waiting',
    sequence: '123456',
    target: 100,
    players: [
      { id: 'user-1', username: 'You', progress: 0, isSelf: true },
    ],
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    leaderboard: [
      { id: 'user-2', username: 'MathWizard', score: 120, solutionTime: 45.2, solution: '1+2*3*4+5*6' },
      { id: 'user-3', username: 'NumberNinja', score: 110, solutionTime: 52.8, solution: '1*2+3*4*5+6' },
      { id: 'user-4', username: 'LogicMaster', score: 105, solutionTime: 58.1, solution: '(1+2)*3*4+5*6' },
    ]
  });
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes
  
  // Handle solution submission
  const handleSubmitSolution = useCallback((solution: string) => {
    // For demo purposes, update the game state locally
    const solutionTime = 300 - timeRemaining;
    const score = Math.round(100 + (100 / solutionTime) * 50); // Higher score for faster solutions
    
    setGameState(prev => ({
      ...prev,
      status: 'completed',
      players: prev.players.map(player => 
        player.isSelf 
          ? { 
              ...player, 
              progress: 1, 
              isCorrect: true, 
              score, 
              solutionTime,
              solution,
            }
          : player
      ),
      // Add player to leaderboard
      leaderboard: [
        { 
          id: 'user-1', 
          username: 'You', 
          score, 
          solutionTime, 
          solution 
        },
        ...(prev.leaderboard || [])
      ].sort((a, b) => b.score - a.score).slice(0, 10) // Sort by score and keep top 10
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center text-white">
        Daily Challenge
      </h1>
      <p className="text-center text-gray-400 mb-6">{gameState.date}</p>
      
      <PuzzleDisplay 
        sequence={gameState.sequence} 
        target={gameState.target}
        timeRemaining={timeRemaining}
        isActive={gameState.status === 'active'}
      />
      
      <ProgressIndicator 
        players={gameState.players} 
        gameMode="daily"
      />
      
      {gameState.status === 'active' && (
        <SolutionInput 
          onSubmit={handleSubmitSolution} 
          isActive={gameState.status === 'active'}
          sequence={gameState.sequence}
        />
      )}
      
      {gameState.status === 'completed' && (
        <div>
          <GameResults 
            players={gameState.players}
            gameMode="daily"
            sequence={gameState.sequence}
            target={gameState.target}
            onPlayAgain={() => navigate('/game')}
          />
          
          {/* Leaderboard */}
          <motion.div 
            className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 text-white">Daily Challenge Leaderboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-gray-400">#</th>
                    <th className="py-3 px-4 text-gray-400">Player</th>
                    <th className="py-3 px-4 text-gray-400">Score</th>
                    <th className="py-3 px-4 text-gray-400">Time</th>
                    <th className="py-3 px-4 text-gray-400">Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {gameState.leaderboard?.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">{index + 1}</td>
                      <td className="py-3 px-4 text-white font-medium">
                        {entry.username === 'You' ? (
                          <span className="text-purple-400">{entry.username}</span>
                        ) : (
                          entry.username
                        )}
                      </td>
                      <td className="py-3 px-4 text-yellow-400 font-medium">{entry.score}</td>
                      <td className="py-3 px-4 text-blue-400">{entry.solutionTime.toFixed(1)}s</td>
                      <td className="py-3 px-4 font-mono text-green-400">{entry.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
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

export default DailyChallenge;
