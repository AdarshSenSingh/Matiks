import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  BoltIcon,
  ClockIcon,
  UserGroupIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  StarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { DarkButton } from "../ui";
import { NumberCounter } from "../animations";
import { useAuth } from "../../hooks/useAuth";

interface DuelMatchmakingProps {
  onCancel: () => void;
  isOpen: boolean;
  isRanked?: boolean;
  error?: string | null;
}

const DuelMatchmakingDark = ({
  onCancel,
  isOpen,
  isRanked = true,
  error = null,
}: DuelMatchmakingProps) => {
  const { user } = useAuth();
  const [searchTime, setSearchTime] = useState(0);
  // Using foundMatch without setter for display logic only
  const [foundMatch] = useState(false);
  // Using opponent without setter for display logic only
  const [opponent] = useState<{
    username: string;
    rating: number;
  } | null>(null);
  const [searchingDots, setSearchingDots] = useState("");
  const [currentTip, setCurrentTip] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(60); // Estimated wait time in seconds
  const [pulseEffect, setPulseEffect] = useState(false);

  // Tips to display while searching
  const tips = [
    {
      icon: <LightBulbIcon className="h-4 w-4 mr-2 text-yellow-400" />,
      text: "Use all six numbers exactly once in your solution.",
    },
    {
      icon: <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />,
      text: "The target number is always 100 in Hectoc puzzles.",
    },
    {
      icon: <ChartBarIcon className="h-4 w-4 mr-2 text-yellow-400" />,
      text: "Ranked matches affect your ELO rating.",
    },
    {
      icon: <ShieldCheckIcon className="h-4 w-4 mr-2 text-yellow-400" />,
      text: "You can use +, -, ×, ÷, and parentheses in your solution.",
    },
  ];

  // Just track search time, don't simulate finding an opponent
  useEffect(() => {
    if (!isOpen) return;

    const searchInterval = setInterval(() => {
      setSearchTime((prev) => prev + 1);
      // Decrease estimated time as search time increases
      setEstimatedTime((prev) => Math.max(5, prev - 1));
    }, 1000);

    return () => clearInterval(searchInterval);
  }, [isOpen]);

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

  // Cycle through tips
  useEffect(() => {
    if (!isOpen || foundMatch) return;

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);

    return () => clearInterval(tipInterval);
  }, [isOpen, foundMatch, tips.length]);

  // Pulse effect every 5 seconds
  useEffect(() => {
    if (!isOpen || foundMatch) return;

    const pulseInterval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 5000);

    return () => clearInterval(pulseInterval);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background effects */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-gray-950 opacity-80"></div>
          <motion.div
            className="bg-gray-900 rounded-xl shadow-xl overflow-hidden w-full max-w-md border border-gray-800/50 relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: pulseEffect
                ? "0 0 30px rgba(79, 70, 229, 0.6)"
                : "0 0 20px rgba(79, 70, 229, 0.3)",
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="absolute inset-0 opacity-10 overflow-hidden bg-pattern-math">
              {/* Math pattern background */}
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
                  <>
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center"
                    >
                      <BoltIcon className="h-5 w-5 mr-2 text-yellow-400" />
                      Finding Opponent{searchingDots}
                    </motion.span>
                  </>
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
                      className="w-32 h-32 rounded-full bg-primary-900/50 mx-auto flex items-center justify-center border border-primary-700/50 shadow-lg shadow-primary-900/20 relative"
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(79, 70, 229, 0.3)",
                          "0 0 30px rgba(79, 70, 229, 0.6)",
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
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <UserGroupIcon className="h-14 w-14 text-primary-400" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-primary-800 rounded-full p-2 border border-primary-600"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <BoltIcon className="h-5 w-5 text-primary-400" />
                    </motion.div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div className="flex justify-between items-center space-x-4">
                      <motion.div
                        className="flex-1 flex items-center justify-center space-x-2 text-gray-300 bg-gray-800/50 py-2 px-4 rounded-lg border border-gray-700/30"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ClockIcon className="h-5 w-5 text-primary-400" />
                        <span>Time: {formatTime(searchTime)}</span>
                      </motion.div>

                      <motion.div
                        className="flex-1 flex items-center justify-center space-x-2 text-gray-300 bg-gray-800/50 py-2 px-4 rounded-lg border border-gray-700/30"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.3,
                        }}
                      >
                        <FireIcon className="h-5 w-5 text-accent-400" />
                        <span>ELO: {user?.rating || 1500}</span>
                      </motion.div>
                    </div>

                    <motion.div
                      className="bg-gray-800/30 py-3 px-4 rounded-lg border border-gray-700/20"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-sm">
                          Estimated wait time
                        </span>
                        <span className="text-primary-400 text-sm font-medium">
                          {formatTime(estimatedTime)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="bg-primary-600 h-1.5"
                          initial={{ width: "100%" }}
                          animate={{ width: `${(estimatedTime / 60) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        ></motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center text-sm text-gray-400 bg-gray-800/30 py-3 px-4 rounded-lg border border-gray-700/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {tips[currentTip].icon}
                      <span>{tips[currentTip].text}</span>
                    </motion.div>

                    {error ? (
                      <motion.div
                        className="bg-red-900/30 text-red-200 p-3 rounded-lg border border-red-800/50 mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <XMarkIcon className="h-5 w-5 inline-block mr-2 text-red-400" />
                        {error}
                      </motion.div>
                    ) : (
                      <div className="flex justify-center space-x-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-900 text-primary-200 border border-primary-700">
                          {isRanked ? (
                            <>
                              <TrophyIcon className="h-3 w-3 mr-1" />
                              Ranked Mode
                            </>
                          ) : (
                            <>
                              <UserGroupIcon className="h-3 w-3 mr-1" />
                              Unranked Mode
                            </>
                          )}
                        </span>

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                          <SparklesIcon className="h-3 w-3 mr-1 text-yellow-400" />
                          Hectoc Puzzle
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <DarkButton
                      variant="ghost"
                      onClick={onCancel}
                      fullWidth
                      className="border border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300 group"
                      icon={
                        <XMarkIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      }
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
                        <span className="text-lg">
                          {user?.username?.charAt(0) || "Y"}
                        </span>
                        <motion.div
                          className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border border-gray-800"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <TrophyIcon className="h-3 w-3 text-white" />
                        </motion.div>
                      </motion.div>
                      <div className="font-medium text-white text-lg">
                        {user?.username || "You"}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center justify-center mt-1">
                        <FireIcon className="h-4 w-4 mr-1 text-primary-400" />
                        <span>{user?.rating || 1500}</span>
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
                        {opponent?.username?.charAt(0) || "O"}
                      </motion.div>
                      <div className="font-medium text-white text-lg">
                        {opponent?.username || "Opponent"}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center justify-center mt-1">
                        <FireIcon className="h-4 w-4 mr-1 text-accent-400" />
                        <NumberCounter
                          value={opponent?.rating || 1500}
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
