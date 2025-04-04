import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Player {
  id: string;
  username: string;
  isCorrect?: boolean;
  score?: number;
  solutionTime?: number;
  solution?: string;
  ratingChange?: number;
  isSelf?: boolean;
}

interface GameResultsProps {
  players: Player[];
  winnerId?: string;
  gameMode: 'ranked' | 'unranked' | 'practice' | 'daily';
  sequence: string;
  target: number;
  onPlayAgain: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ 
  players, 
  winnerId, 
  gameMode, 
  sequence, 
  target,
  onPlayAgain 
}) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => {
    // If both have scores, sort by score
    if (a.score !== undefined && b.score !== undefined) {
      return b.score - a.score;
    }
    // If only one has a score, that one comes first
    if (a.score !== undefined) return -1;
    if (b.score !== undefined) return 1;
    // Otherwise sort by solution time
    return (a.solutionTime || Infinity) - (b.solutionTime || Infinity);
  });
  
  // Find the winner
  const winner = players.find(p => p.id === winnerId);
  
  // Check if the current user won
  const userWon = winner?.isSelf;
  
  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        {gameMode === 'practice' 
          ? 'Practice Results' 
          : gameMode === 'daily' 
            ? 'Daily Challenge Results' 
            : 'Duel Results'}
      </h2>
      
      {winner && (
        <div className="mb-6 text-center">
          <div className="text-xl font-bold text-yellow-400 mb-2">
            {userWon ? 'You Won!' : `${winner.username} Won!`}
          </div>
          <div className="text-gray-400">
            Puzzle: {sequence.split('').join(' ')} → {target}
          </div>
        </div>
      )}
      
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold mb-3 text-white">Player Results</h3>
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`p-3 rounded-lg ${
                player.id === winnerId 
                  ? 'bg-gradient-to-r from-yellow-800 to-yellow-900 border border-yellow-600' 
                  : 'bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="text-gray-400 mr-2">{index + 1}.</div>
                  <div className={`font-medium ${player.isSelf ? 'text-purple-300' : 'text-white'}`}>
                    {player.username} {player.isSelf && '(You)'}
                  </div>
                </div>
                
                {player.isCorrect !== undefined && (
                  <div className={`text-sm font-medium ${player.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {player.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                {player.score !== undefined && (
                  <div className="text-yellow-400">
                    Score: {player.score}
                  </div>
                )}
                
                {player.solutionTime !== undefined && (
                  <div className="text-blue-400">
                    Time: {player.solutionTime.toFixed(2)}s
                  </div>
                )}
                
                {gameMode === 'ranked' && player.ratingChange !== undefined && (
                  <div className={`${player.ratingChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Rating: {player.ratingChange > 0 ? '+' : ''}{player.ratingChange}
                  </div>
                )}
                
                {player.solution && (
                  <div className="col-span-2 mt-2 font-mono bg-gray-700 p-2 rounded text-white">
                    {player.solution}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-bold"
          onClick={onPlayAgain}
        >
          Play Again
        </motion.button>
        
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg"
          >
            Back to Home
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default GameResults;
