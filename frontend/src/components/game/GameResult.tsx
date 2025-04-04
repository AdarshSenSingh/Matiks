import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  TrophyIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { Confetti } from '../animations';

interface GameResultProps {
  result: 'win' | 'lose' | 'draw';
  solution?: string;
  explanation?: string;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  ratingChange?: number;
}

const GameResult = ({
  result,
  solution = '1+(2+3+4)×(5+6) = 100',
  explanation = '= 1+9×11 = 1+99 = 100',
  onPlayAgain,
  onViewLeaderboard,
  ratingChange,
}: GameResultProps) => {
  return (
    <motion.div 
      className={`p-6 rounded-lg ${
        result === 'win' 
          ? 'bg-green-50 border border-green-200' 
          : result === 'lose'
            ? 'bg-red-50 border border-red-200'
            : 'bg-yellow-50 border border-yellow-200'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Confetti effect for wins */}
      {result === 'win' && <Confetti active={true} />}
      
      <div className="flex items-start">
        {result === 'win' ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
        ) : result === 'lose' ? (
          <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
        ) : (
          <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
        )}
        
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">
            {result === 'win' 
              ? 'You won this round!' 
              : result === 'lose'
                ? 'Your opponent won this round.'
                : 'It\'s a draw!'}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {result === 'win' 
              ? 'Great job! You solved the puzzle correctly.'
              : result === 'lose'
                ? 'Better luck next time. Keep practicing to improve your skills.'
                : 'Both players solved the puzzle in the same time.'}
          </p>
          
          {ratingChange !== undefined && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              ratingChange > 0 
                ? 'bg-green-100 text-green-800' 
                : ratingChange < 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {ratingChange > 0 ? '+' : ''}{ratingChange} Rating
            </div>
          )}
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Optimal solution:</h3>
            <p className="font-mono text-lg">{solution}</p>
            <p className="text-sm text-gray-500 mt-1">{explanation}</p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              variant="primary"
              onClick={onPlayAgain}
              fullWidth
              icon={<ArrowPathIcon className="h-5 w-5 mr-2" />}
            >
              Play Again
            </Button>
            <Button
              variant="outline"
              onClick={onViewLeaderboard}
              fullWidth
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameResult;
