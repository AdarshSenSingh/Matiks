import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  UserIcon, 
  ClockIcon, 
  AcademicCapIcon,
  TrophyIcon,
  ArrowRightIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardBody, CardHeader } from '../components/ui';
import { FadeIn, ScaleIn, ScrollReveal } from '../components/animations';
import DuelMatchmaking from '../components/game/DuelMatchmaking';

const PlayLobby = () => {
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const navigate = useNavigate();

  const handleStartDuel = () => {
    setShowMatchmaking(true);
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);
  };

  const handlePracticeMode = () => {
    navigate('/play');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FadeIn className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <ScaleIn>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Game Mode</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Challenge yourself or compete against other players in different Hectoc game modes.
            </p>
          </ScaleIn>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Duel Mode */}
          <ScrollReveal>
            <Card hover className="h-full transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Duel Mode</h2>
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardBody className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4">
                    <BoltIcon className="h-3 w-3 mr-1" />
                    Real-time Competition
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Challenge other players in real-time duels. Solve the puzzle faster than your opponent to win!
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-primary-500" />
                      <span>60-second time limit</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-primary-500" />
                      <span>Matched with players of similar skill</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrophyIcon className="h-4 w-4 mr-2 text-primary-500" />
                      <span>Earn rating points for wins</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleStartDuel}
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                >
                  Find Opponent
                </Button>
              </CardBody>
            </Card>
          </ScrollReveal>
          
          {/* Practice Mode */}
          <ScrollReveal delay={0.1}>
            <Card hover className="h-full transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="bg-gradient-to-r from-secondary-600 to-secondary-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Practice Mode</h2>
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardBody className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className="bg-secondary-100 text-secondary-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Self-paced
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Practice solving Hectoc puzzles at your own pace. Perfect for improving your skills.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-secondary-500" />
                      <span>No time pressure</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-2 text-secondary-500" />
                      <span>Play solo at your own pace</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <AcademicCapIcon className="h-4 w-4 mr-2 text-secondary-500" />
                      <span>Learn strategies and techniques</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handlePracticeMode}
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                >
                  Start Practice
                </Button>
              </CardBody>
            </Card>
          </ScrollReveal>
          
          {/* Daily Challenge */}
          <ScrollReveal delay={0.2}>
            <Card hover className="h-full transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="bg-gradient-to-r from-accent-600 to-accent-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Daily Challenge</h2>
                  <TrophyIcon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardBody className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className="bg-accent-100 text-accent-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4">
                    <BoltIcon className="h-3 w-3 mr-1" />
                    Daily Puzzle
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    A new challenging puzzle every day. Compare your solution time with other players.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-accent-500" />
                      <span>New puzzle every 24 hours</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-accent-500" />
                      <span>Global leaderboard for each puzzle</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrophyIcon className="h-4 w-4 mr-2 text-accent-500" />
                      <span>Earn badges for streaks</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="accent"
                  fullWidth
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                >
                  Today's Challenge
                </Button>
              </CardBody>
            </Card>
          </ScrollReveal>
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/leaderboard">
            <Button variant="outline" className="mx-auto">
              View Global Leaderboard
            </Button>
          </Link>
        </div>
        
        {/* Game stats */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">42</div>
              <div className="text-sm text-gray-500">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">28</div>
              <div className="text-sm text-gray-500">Games Won</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600">66.7%</div>
              <div className="text-sm text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600">1800</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
          </div>
        </div>
      </FadeIn>
      
      {/* Matchmaking modal */}
      <DuelMatchmaking isOpen={showMatchmaking} onCancel={handleCancelMatchmaking} />
    </div>
  );
};

export default PlayLobby;
