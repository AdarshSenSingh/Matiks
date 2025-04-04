import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  UserIcon, 
  ClockIcon, 
  AcademicCapIcon,
  TrophyIcon,
  ArrowRightIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { GradientButton } from '../components/ui';
import { 
  AnimatedText, 
  ParticleBackground, 
  TiltCard, 
  FloatingElement 
} from '../components/animations';
import DuelMatchmaking from '../components/game/DuelMatchmaking';

const PlayLobbyEnhanced = () => {
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const navigate = useNavigate();

  const handleStartDuel = () => {
    setShowMatchmaking(true);
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);
  };

  const handlePracticeMode = () => {
    navigate('/play/practice');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <ParticleBackground 
        count={50} 
        colors={['#4f46e5', '#7c3aed', '#2563eb', '#0ea5e9', '#0891b2']} 
        speed={0.3}
        className="opacity-30"
      />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-secondary-500 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-500 rounded-full opacity-10 blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <AnimatedText
            text="Choose Your Game Mode"
            type="words"
            animationType="wave"
            className="text-4xl font-bold text-white mb-4"
            tag="h1"
          />
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Challenge yourself or compete against other players in different Hectoc game modes.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Duel Mode */}
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div className="bg-gradient-to-br from-primary-800/50 to-primary-900/50 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-xl h-full transform transition-all duration-300 hover:shadow-primary-500/20">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Duel Mode</h2>
                    <FloatingElement yOffset={5} duration={2}>
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </FloatingElement>
                  </div>
                </div>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="bg-primary-800/50 text-primary-300 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4">
                      <BoltIcon className="h-3 w-3 mr-1" />
                      Real-time Competition
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      Challenge other players in real-time duels. Solve the puzzle faster than your opponent to win!
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-300">
                        <ClockIcon className="h-4 w-4 mr-2 text-primary-400" />
                        <span>60-second time limit</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-primary-400" />
                        <span>Matched with players of similar skill</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <TrophyIcon className="h-4 w-4 mr-2 text-primary-400" />
                        <span>Earn rating points for wins</span>
                      </div>
                    </div>
                  </div>
                  
                  <GradientButton
                    variant="primary"
                    fullWidth
                    onClick={handleStartDuel}
                    icon={<ArrowRightIcon className="h-5 w-5" />}
                    iconPosition="right"
                    glow
                  >
                    Find Opponent
                  </GradientButton>
                </div>
              </div>
            </TiltCard>
          </motion.div>
          
          {/* Practice Mode */}
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div className="bg-gradient-to-br from-secondary-800/50 to-secondary-900/50 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-xl h-full transform transition-all duration-300 hover:shadow-secondary-500/20">
                <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Practice Mode</h2>
                    <FloatingElement yOffset={5} duration={2.5}>
                      <UserIcon className="h-6 w-6 text-white" />
                    </FloatingElement>
                  </div>
                </div>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="bg-secondary-800/50 text-secondary-300 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Self-paced
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      Practice solving Hectoc puzzles at your own pace. Perfect for improving your skills.
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-300">
                        <ClockIcon className="h-4 w-4 mr-2 text-secondary-400" />
                        <span>No time pressure</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <UserIcon className="h-4 w-4 mr-2 text-secondary-400" />
                        <span>Play solo at your own pace</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <AcademicCapIcon className="h-4 w-4 mr-2 text-secondary-400" />
                        <span>Learn strategies and techniques</span>
                      </div>
                    </div>
                  </div>
                  
                  <GradientButton
                    variant="secondary"
                    fullWidth
                    onClick={handlePracticeMode}
                    icon={<ArrowRightIcon className="h-5 w-5" />}
                    iconPosition="right"
                    glow
                  >
                    Start Practice
                  </GradientButton>
                </div>
              </div>
            </TiltCard>
          </motion.div>
          
          {/* Daily Challenge */}
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div className="bg-gradient-to-br from-accent-800/50 to-accent-900/50 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-xl h-full transform transition-all duration-300 hover:shadow-accent-500/20">
                <div className="bg-gradient-to-r from-accent-600 to-accent-700 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Daily Challenge</h2>
                    <FloatingElement yOffset={5} duration={3}>
                      <TrophyIcon className="h-6 w-6 text-white" />
                    </FloatingElement>
                  </div>
                </div>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="bg-accent-800/50 text-accent-300 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      Daily Puzzle
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      A new challenging puzzle every day. Compare your solution time with other players.
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-300">
                        <ClockIcon className="h-4 w-4 mr-2 text-accent-400" />
                        <span>New puzzle every 24 hours</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-accent-400" />
                        <span>Global leaderboard for each puzzle</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <TrophyIcon className="h-4 w-4 mr-2 text-accent-400" />
                        <span>Earn badges for streaks</span>
                      </div>
                    </div>
                  </div>
                  
                  <GradientButton
                    variant="accent"
                    fullWidth
                    icon={<ArrowRightIcon className="h-5 w-5" />}
                    iconPosition="right"
                    glow
                  >
                    Today's Challenge
                  </GradientButton>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-gradient-to-br from-primary-800/30 to-primary-900/30 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-xl p-6">
            <h2 className="text-xl font-bold mb-6 text-center text-white flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-accent-400" />
              Your Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">42</div>
                <div className="text-sm text-gray-300">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">28</div>
                <div className="text-sm text-gray-300">Games Won</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-400">66.7%</div>
                <div className="text-sm text-gray-300">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-400">1800</div>
                <div className="text-sm text-gray-300">Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Matchmaking modal */}
      <DuelMatchmaking isOpen={showMatchmaking} onCancel={handleCancelMatchmaking} />
    </div>
  );
};

export default PlayLobbyEnhanced;
