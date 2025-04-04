import React from 'react';
import { motion } from 'framer-motion';

interface PuzzleDisplayProps {
  sequence: string;
  target?: number;
  timeRemaining?: number;
  isActive: boolean;
}

const PuzzleDisplay: React.FC<PuzzleDisplayProps> = ({ 
  sequence, 
  target = 100, 
  timeRemaining,
  isActive 
}) => {
  // Format the sequence with spaces between digits for better readability
  const formattedSequence = sequence.split('').join(' ');
  
  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-400 text-sm">
          Target: <span className="text-white font-bold">{target}</span>
        </div>
        
        {timeRemaining !== undefined && (
          <div className={`text-sm ${timeRemaining < 30 ? 'text-red-400' : 'text-gray-400'}`}>
            Time: <span className="font-bold">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
      
      <motion.div 
        className="flex justify-center items-center p-8 bg-gray-900 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-wider text-white">
          {isActive ? formattedSequence : '? ? ? ? ? ?'}
        </h1>
      </motion.div>
      
      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>Use all six numbers exactly once with basic operations (+, -, *, /) to reach the target.</p>
      </div>
    </div>
  );
};

export default PuzzleDisplay;
