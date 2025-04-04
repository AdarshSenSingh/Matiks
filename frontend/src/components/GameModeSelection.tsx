import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ title, description, icon, to, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${color} rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center h-full transition-all duration-300`}
    >
      <Link to={to} className="flex flex-col items-center w-full h-full">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </Link>
    </motion.div>
  );
};

const GameModeSelection: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Select Game Mode</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ranked Duel */}
        <GameModeCard
          title="Ranked Duel"
          description="Compete against other players in ranked matches to climb the leaderboard."
          icon={<i className="fas fa-trophy"></i>}
          to="/game/duel/ranked"
          color="bg-gradient-to-br from-purple-600 to-indigo-800"
        />
        
        {/* Unranked Duel */}
        <GameModeCard
          title="Unranked Duel"
          description="Practice your skills against other players without affecting your ranking."
          icon={<i className="fas fa-handshake"></i>}
          to="/game/duel/unranked"
          color="bg-gradient-to-br from-blue-600 to-blue-800"
        />
        
        {/* Practice */}
        <GameModeCard
          title="Practice"
          description="Solve puzzles at your own pace to improve your skills."
          icon={<i className="fas fa-brain"></i>}
          to="/game/practice"
          color="bg-gradient-to-br from-green-600 to-green-800"
        />
        
        {/* Daily Challenge */}
        <GameModeCard
          title="Daily Challenge"
          description="A new puzzle every day. Compare your solution with others."
          icon={<i className="fas fa-calendar-day"></i>}
          to="/game/daily"
          color="bg-gradient-to-br from-amber-600 to-amber-800"
        />
      </div>
      
      <div className="mt-8 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg"
          onClick={() => window.history.back()}
        >
          Back
        </motion.button>
      </div>
    </div>
  );
};

export default GameModeSelection;
