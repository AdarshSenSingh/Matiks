import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowPathIcon,
  XMarkIcon,
  BoltIcon,
  ClockIcon,
  UserGroupIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { DarkButton } from "../ui";
import { NumberCounter, MathBackground } from "../animations";

interface DuelMatchmakingProps {
  onCancel: () => void;
  isOpen: boolean;
}

const DuelMatchmakingDark = ({ onCancel, isOpen }: DuelMatchmakingProps) => {
  const [searchTime, setSearchTime] = useState(0);
  const [foundMatch, setFoundMatch] = useState(false);
  const [opponent, setOpponent] = useState<{
    username: string;
    rating: number;
  } | null>(null);
  const [searchingDots, setSearchingDots] = useState("");
  const navigate = useNavigate();

  // Simulate searching for an opponent
  useEffect(() => {
    if (!isOpen) return;

    const searchInterval = setInterval(() => {
      setSearchTime((prev) => prev + 1);

      // Simulate finding a match after a random time between 3-8 seconds
      if (searchTime > 0 && !foundMatch && Math.random() < 0.1) {
        setFoundMatch(true);

        // Generate a random opponent
        const opponents = [
          { username: "MathWizard", rating: 1850 },
          { username: "NumberNinja", rating: 1920 },
          { username: "CalculusKing", rating: 2100 },
          { username: "AlgebraMaster", rating: 1750 },
          { username: "PrimeTime", rating: 1680 },
        ];

        setOpponent(opponents[Math.floor(Math.random() * opponents.length)]);

        // Navigate to game after a short delay
        setTimeout(() => {
          navigate("/play/duel");
        }, 3000);
      }
    }, 1000);

    return () => clearInterval(searchInterval);
  }, [isOpen, searchTime, foundMatch, navigate]);

  // Animate searching dots
  useEffect(() => {
    if (!isOpen || foundMatch) return;

    const dotsInterval = setInterval(() => {
      setSearchingDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, [isOpen, foundMatch]);

  // Format search time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
            className="bg-gray-900 rounded-xl shadow-xl overflow-hidden w-full max-w-md border border-gray-800/50 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="absolute inset-0 opacity-10 overflow-hidden">
              <MathBackground
                speed={0.5}
                size={30}
                color="rgba(79, 70, 229, 0.2)"
              />
            </div>
            <div className="bg-gradient-to-r from-primary-800 to-primary-900 p-5 text-white relative border-b border-primary-700/50">
              <motion.h2
                className="text-xl font-bold text-center flex items-center justify-center"
                animate={foundMatch ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: foundMatch ? 3 : 0 }}
              >
                {foundMatch ? (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    Opponent Found!
                    <SparklesIcon className="h-5 w-5 ml-2 text-yellow-400" />
                  </>
                ) : (
                  `Finding Opponent${searchingDots}`
                )}
              </motion.h2>
              <motion.button
                onClick={onCancel}
                className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
                disabled={foundMatch}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
            </div>

            <div className="p-6 bg-gray-900 text-white">
              {!foundMatch ? (
                <div className="text-center">
                  <div className="mb-8 relative">
                    <motion.div
                      className="w-28 h-28 rounded-full bg-primary-900/50 mx-auto flex items-center justify-center border border-primary-700/50 shadow-lg shadow-primary-900/20 relative"
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(79, 70, 229, 0.3)",
                          "0 0 20px rgba(79, 70, 229, 0.6)",
                          "0 0 0 rgba(79, 70, 229, 0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0"
                      >
                        <div className="h-full w-full rounded-full border-t-4 border-primary-500 opacity-75"></div>
                      </motion.div>
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-2"
                      >
                        <div className="h-full w-full rounded-full border-t-2 border-r-2 border-accent-500 opacity-50"></div>
                      </motion.div>
                      <UserGroupIcon className="h-12 w-12 text-primary-400 animate-pulse" />
                    </motion.div>

                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-primary-800 rounded-full p-2 border border-primary-600"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <BoltIcon className="h-5 w-5 text-primary-400" />
                    </motion.div>
                  </div>

                  <div className="mb-6">
                    <motion.div
                      className="inline-flex items-center justify-center space-x-2 text-gray-300 mb-3 bg-gray-800/50 py-2 px-4 rounded-full mx-auto border border-gray-700/30"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ClockIcon className="h-5 w-5 text-primary-400" />
                      <span>Search time: {formatTime(searchTime)}</span>
                    </motion.div>
                    <p className="text-gray-400 bg-gray-800/30 py-3 px-4 rounded-lg border border-gray-700/20">
                      Looking for players with similar skill level...
                    </p>
                  </div>

                  <div className="mt-8">
                    <DarkButton
                      variant="ghost"
                      onClick={onCancel}
                      fullWidth
                      className="border border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300"
                      icon={<XMarkIcon className="h-5 w-5 mr-2" />}
                    >
                      Cancel Search
                    </DarkButton>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-10 mb-10">
                    <motion.div
                      className="text-center"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-800 to-primary-600 flex items-center justify-center text-white font-bold mx-auto mb-3 border-2 border-primary-500/50 shadow-lg shadow-primary-900/30 relative"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-lg">You</span>
                        <motion.div
                          className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border border-gray-800"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <TrophyIcon className="h-3 w-3 text-white" />
                        </motion.div>
                      </motion.div>
                      <div className="font-medium text-white text-lg">You</div>
                      <div className="text-sm text-gray-400 flex items-center justify-center mt-1">
                        <FireIcon className="h-4 w-4 mr-1 text-primary-400" />
                        <span>1800</span>
                      </div>
                    </motion.div>

                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-gray-800/70 p-3 rounded-full border border-gray-700/50 shadow-lg"
                      >
                        <BoltIcon className="h-8 w-8 text-yellow-400" />
                      </motion.div>
                      <div className="text-xl font-bold text-gray-400 mt-2">
                        VS
                      </div>
                    </div>

                    <motion.div
                      className="text-center"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.div
                        className="h-20 w-20 rounded-full bg-gradient-to-br from-accent-800 to-accent-600 flex items-center justify-center text-white font-bold mx-auto mb-3 border-2 border-accent-500/50 shadow-lg shadow-accent-900/30"
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      >
                        {opponent?.username.charAt(0)}
                      </motion.div>
                      <div className="font-medium text-white text-lg">
                        {opponent?.username}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center justify-center mt-1">
                        <FireIcon className="h-4 w-4 mr-1 text-accent-400" />
                        <NumberCounter
                          value={opponent?.rating || 0}
                          duration={1}
                        />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="w-full bg-gray-800/70 rounded-full h-3 mb-6 overflow-hidden border border-gray-700/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      className="bg-gradient-to-r from-primary-600 to-accent-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                    ></motion.div>
                  </motion.div>

                  <motion.div
                    className="text-gray-300 animate-pulse bg-gray-800/50 py-3 px-6 rounded-lg inline-block border border-gray-700/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <SparklesIcon className="h-5 w-5 inline mr-2 text-yellow-400" />
                    Preparing game...
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DuelMatchmakingDark;
