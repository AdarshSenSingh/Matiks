import React from 'react';
import { motion } from 'framer-motion';

interface Player {
  id: string;
  username: string;
  progress: number;
  isCorrect?: boolean;
  score?: number;
  isSelf?: boolean;
}

interface ProgressIndicatorProps {
  players: Player[];
  gameMode: 'ranked' | 'unranked' | 'practice' | 'daily';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ players, gameMode }) => {
  // Sort players by progress (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress);
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4 text-white">
        {gameMode === 'practice' ? 'Your Progress' : 'Player Progress'}
      </h3>
      
      <div className="space-y-4">
        {sortedPlayers.map((player) => (
          <div key={player.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${player.isSelf ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                <span className={`font-medium ${player.isSelf ? 'text-purple-300' : 'text-white'}`}>
                  {player.username} {player.isSelf && '(You)'}
                </span>
              </div>
              
              {player.isCorrect !== undefined && (
                <div className={`text-sm font-medium ${player.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {player.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              )}
              
              {player.score !== undefined && (
                <div className="text-sm font-medium text-yellow-400">
                  Score: {player.score}
                </div>
              )}
            </div>
            
            <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  player.isCorrect 
                    ? 'bg-green-500' 
                    : player.progress === 1 
                      ? 'bg-red-500' 
                      : player.isSelf 
                        ? 'bg-purple-500' 
                        : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${player.progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
