import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  XCircleIcon, 
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  ArrowLeftIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { GradientButton, GlassCard, GlassCardBody, GlassCardHeader } from '../components/ui';
import { 
  ParticleBackground, 
  FloatingElement, 
  AnimatedText,
  TiltCard,
} from '../components/animations';

import {
  CountdownTimer, 
  ProgressBar, 
  GameResult,
  PuzzleDisplay
} from '../components/game';

// Mock opponent data
const OPPONENT = {
  username: 'MathWizard',
  rating: 1850,
  avatar: 'M'
};

const DuelGameEnhanced = () => {
  const [puzzle, setPuzzle] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [opponentProgress, setOpponentProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(3);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Generate a random puzzle
  useEffect(() => {
    const generatePuzzle = () => {
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += Math.floor(Math.random() * 9) + 1;
      }
      return result;
    };

    setPuzzle(generatePuzzle());
    
    // Start with countdown
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setShowCountdown(false);
          setGameStatus('active');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  // Focus the input field when the game starts
  useEffect(() => {
    if (gameStatus === 'active' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus]);

  // Timer countdown and opponent simulation
  useEffect(() => {
    if (gameStatus !== 'active' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      
      // Simulate opponent progress
      if (Math.random() > 0.8) {
        setOpponentProgress((prev) => {
          const newProgress = Math.min(prev + Math.floor(Math.random() * 15) + 5, 100);
          if (newProgress === 100 && gameStatus === 'active') {
            setGameStatus('completed');
            setResult('lose');
          }
          return newProgress;
        });
      }
      
      // Update player progress based on solution length
      if (solution.length > 0) {
        setPlayerProgress(Math.min((solution.length / 15) * 100, 95));
      }
    }, 1000);

    if (timeLeft === 0) {
      setGameStatus('completed');
      setResult(opponentProgress >= playerProgress ? 'lose' : 'win');
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, solution, opponentProgress, playerProgress]);

  // Hide particles on game completion to improve performance
  useEffect(() => {
    if (gameStatus === 'completed') {
      setShowParticles(false);
    }
  }, [gameStatus]);

  const handleSolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || gameStatus !== 'active') return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, let's say the solution is correct if it contains all digits and some operators
      const containsAllDigits = puzzle.split('').every(digit => solution.includes(digit));
      const containsOperators = /[+\-*\/()^]/.test(solution);
      const isCorrect = containsAllDigits && containsOperators;
      
      setPlayerProgress(100);
      setGameStatus('completed');
      setResult(isCorrect ? 'win' : 'lose');
      
      // Update streak if win
      if (isCorrect) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error('Error validating solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAgain = () => {
    navigate('/play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      {showParticles && (
        <ParticleBackground 
          count={50} 
          colors={['#4f46e5', '#7c3aed', '#2563eb', '#0ea5e9', '#0891b2']} 
          speed={0.3}
          className="opacity-30"
        />
      )}
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-secondary-500 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-500 rounded-full opacity-10 blur-3xl" />
      
      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="relative"
            >
              <motion.div
                className="text-white text-9xl font-bold"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              >
                {countdown}
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white"
                initial={{ scale: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          className="mb-4 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GradientButton 
            variant="secondary" 
            size="sm"
            className="text-white"
            onClick={() => navigate('/play')}
            icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
          >
            Back to Lobby
          </GradientButton>
          
          {streak > 0 && (
            <motion.div 
              className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <FireIcon className="h-5 w-5 mr-1 animate-pulse" />
              <span className="font-bold">{streak} Win Streak!</span>
            </motion.div>
          )}
        </motion.div>
        
        <TiltCard className="overflow-visible" tiltFactor={5}>
          <GlassCard className="overflow-visible">
            {/* Game Header */}
            <GlassCardHeader className="relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <AnimatedText
                    text="Hectoc Duel"
                    type="chars"
                    animationType="wave"
                    className="text-2xl md:text-3xl font-bold text-white flex items-center"
                    tag="h1"
                  >
                    <TrophyIcon className="h-6 w-6 mr-2" />
                  </AnimatedText>
                  
                  <FloatingElement yOffset={5} duration={2}>
                    <CountdownTimer 
                      initialTime={timeLeft} 
                      size="lg" 
                      warningThreshold={30}
                      dangerThreshold={10}
                      onComplete={() => {
                        if (gameStatus === 'active') {
                          setGameStatus('completed');
                          setResult(opponentProgress >= playerProgress ? 'lose' : 'win');
                        }
                      }}
                    />
                  </FloatingElement>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Player progress */}
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                        Y
                      </div>
                      <div>
                        <div className="font-medium text-white">You</div>
                        <div className="text-xs text-gray-200">1800</div>
                      </div>
                      <div className="ml-auto text-sm font-medium text-white">{playerProgress}%</div>
                    </div>
                    <ProgressBar 
                      progress={playerProgress} 
                      color="bg-accent-500" 
                      height={6} 
                      className="bg-white bg-opacity-20" 
                    />
                  </div>
                  
                  {/* Opponent progress */}
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-secondary-500 flex items-center justify-center text-white font-bold">
                        {OPPONENT.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-white">{OPPONENT.username}</div>
                        <div className="text-xs text-gray-200">{OPPONENT.rating}</div>
                      </div>
                      <div className="ml-auto text-sm font-medium text-white">{opponentProgress}%</div>
                    </div>
                    <ProgressBar 
                      progress={opponentProgress} 
                      color="bg-secondary-500" 
                      height={6} 
                      className="bg-white bg-opacity-20" 
                    />
                  </div>
                </div>
              </div>
            </GlassCardHeader>
            
            {/* Game Content */}
            <GlassCardBody className="p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-accent-400" />
                  Your Puzzle:
                </h2>
                
                <PuzzleDisplay 
                  puzzle={puzzle} 
                  size="md" 
                  className="mb-6" 
                />
                
                <p className="text-center text-gray-300">
                  Insert operations to make the expression equal to 100. Use the digits in the given order.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="solution" className="block text-white font-semibold mb-2 flex items-center">
                    <BoltIcon className="h-5 w-5 mr-2 text-accent-400" />
                    Your Solution:
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      id="solution"
                      className="w-full px-4 py-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-mono text-lg bg-white/10 text-white backdrop-blur-sm"
                      value={solution}
                      onChange={handleSolutionChange}
                      placeholder="e.g., 1+(2+3+4)×(5+6)"
                      disabled={gameStatus === 'completed' || isSubmitting || showCountdown}
                    />
                    {solution.length > 0 && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setSolution('')}
                        disabled={gameStatus === 'completed' || isSubmitting}
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm text-gray-300">
                      Use +, -, *, /, ^, and () to create an expression that equals 100.
                    </p>
                    <button
                      type="button"
                      className="text-accent-400 hover:text-accent-300 text-sm flex items-center"
                      onClick={() => setShowHint(!showHint)}
                    >
                      <LightBulbIcon className="h-4 w-4 mr-1" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  </div>
                  
                  {/* Hint section */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 bg-yellow-900/30 border border-yellow-500/30 rounded-md p-3"
                      >
                        <p className="text-sm text-yellow-300">
                          <span className="font-medium">Hint:</span> Try grouping some numbers together with parentheses before applying operations.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex space-x-4">
                  <GradientButton
                    type="submit"
                    variant="accent"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={isSubmitting || gameStatus === 'completed' || showCountdown}
                    glow
                  >
                    {isSubmitting ? 'Checking...' : 'Submit Solution'}
                  </GradientButton>
                </div>
              </form>

              {/* Game Result */}
              <AnimatePresence>
                {gameStatus === "completed" && result && (
                  <GameResult 
                    result={result}
                    solution="1+(2+3+4)×(5+6) = 100"
                    explanation="= 1+9×11 = 1+99 = 100"
                    onPlayAgain={playAgain}
                    onViewLeaderboard={() => navigate("/leaderboard")}
                    ratingChange={result === 'win' ? 15 : -10}
                  />
                )}
              </AnimatePresence>
            </GlassCardBody>
          </GlassCard>
        </TiltCard>
      </div>
    </div>
  );
};

export default DuelGameEnhanced;
