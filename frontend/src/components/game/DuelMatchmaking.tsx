import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ArrowPathIcon, 
  XMarkIcon, 
  BoltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface DuelMatchmakingProps {
  onCancel: () => void;
  isOpen: boolean;
}

const DuelMatchmaking = ({ onCancel, isOpen }: DuelMatchmakingProps) => {
  const [searchTime, setSearchTime] = useState(0);
  const [foundMatch, setFoundMatch] = useState(false);
  const [opponent, setOpponent] = useState<{ username: string; rating: number } | null>(null);
  const navigate = useNavigate();

  // Simulate searching for an opponent
  useEffect(() => {
    if (!isOpen) return;
    
    const searchInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
      
      // Simulate finding a match after a random time between 3-8 seconds
      if (searchTime > 0 && !foundMatch && Math.random() < 0.1) {
        setFoundMatch(true);
        
        // Generate a random opponent
        const opponents = [
          { username: 'MathWizard', rating: 1850 },
          { username: 'NumberNinja', rating: 1920 },
          { username: 'CalculusKing', rating: 2100 },
          { username: 'AlgebraMaster', rating: 1750 },
          { username: 'PrimeTime', rating: 1680 },
        ];
        
        setOpponent(opponents[Math.floor(Math.random() * opponents.length)]);
        
        // Navigate to game after a short delay
        setTimeout(() => {
          navigate('/play/duel');
        }, 3000);
      }
    }, 1000);
    
    return () => clearInterval(searchInterval);
  }, [isOpen, searchTime, foundMatch, navigate]);

  // Format search time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 text-white relative">
              <h2 className="text-xl font-bold text-center">
                {foundMatch ? 'Opponent Found!' : 'Finding Opponent...'}
              </h2>
              <button 
                onClick={onCancel}
                className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
                disabled={foundMatch}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {!foundMatch ? (
                <div className="text-center">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 rounded-full bg-primary-100 mx-auto flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                      >
                        <div className="h-full w-full rounded-full border-t-4 border-primary-500 opacity-75"></div>
                      </motion.div>
                      <ArrowPathIcon className="h-10 w-10 text-primary-600 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
                      <ClockIcon className="h-5 w-5" />
                      <span>Search time: {formatTime(searchTime)}</span>
                    </div>
                    <p className="text-gray-600">
                      Looking for players with similar skill level...
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      onClick={onCancel}
                      fullWidth
                    >
                      Cancel Search
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-8 mb-8">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mx-auto mb-2">
                        You
                      </div>
                      <div className="font-medium">You</div>
                      <div className="text-sm text-gray-500">1800</div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <BoltIcon className="h-8 w-8 text-yellow-500" />
                      </motion.div>
                      <div className="text-lg font-bold text-gray-400">VS</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold mx-auto mb-2">
                        {opponent?.username.charAt(0)}
                      </div>
                      <div className="font-medium">{opponent?.username}</div>
                      <div className="text-sm text-gray-500">{opponent?.rating}</div>
                    </div>
                  </div>
                  
                  <motion.div
                    className="w-full bg-gray-200 rounded-full h-2.5 mb-6"
                    initial={{ width: 0 }}
                  >
                    <motion.div
                      className="bg-primary-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                    ></motion.div>
                  </motion.div>
                  
                  <p className="text-gray-600 animate-pulse">
                    Preparing game...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DuelMatchmaking;
