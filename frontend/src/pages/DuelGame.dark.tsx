import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  XCircleIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  ArrowLeftIcon,
  BoltIcon,
  SparklesIcon,
  ClockIcon,
  UserIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  DarkButton,
  DarkCard,
  DarkCardHeader,
  DarkCardBody,
  DarkCardFooter,
} from "../components/ui";
import DuelMatchmaking from "../components/game/DuelMatchmaking.dark";
import {
  MathBackground,
  NumberCounter,
  EquationSolver,
  GameResult,
} from "../components/animations";
import { CountdownTimer, ProgressBar, PuzzleDisplay } from "../components/game";

// Mock opponent data
const OPPONENT = {
  username: "MathWizard",
  rating: 1850,
  avatar: "M",
};

const DuelGameDark = () => {
  const [puzzle, setPuzzle] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "completed"
  >("waiting");
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [opponentProgress, setOpponentProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(3);
  const [showMathBg, setShowMathBg] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Generate a random puzzle
  useEffect(() => {
    const generatePuzzle = () => {
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += Math.floor(Math.random() * 9) + 1;
      }
      return result;
    };

    setPuzzle(generatePuzzle());

    // Start with countdown
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setShowCountdown(false);
          setGameStatus("active");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  // Focus the input field when the game starts
  useEffect(() => {
    if (gameStatus === "active" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus]);

  // Timer countdown and opponent simulation
  useEffect(() => {
    if (gameStatus !== "active" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);

      // Simulate opponent progress
      if (Math.random() > 0.8) {
        setOpponentProgress((prev) => {
          const newProgress = Math.min(
            prev + Math.floor(Math.random() * 15) + 5,
            100
          );
          if (newProgress === 100 && gameStatus === "active") {
            setGameStatus("completed");
            setResult("lose");
          }
          return newProgress;
        });
      }

      // Update player progress based on solution length
      // This is likely causing the infinite loop - don't update on every render
      // Only update when solution changes
    }, 1000);

    if (timeLeft === 0) {
      setGameStatus("completed");
      setResult(opponentProgress >= playerProgress ? "lose" : "win");
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, opponentProgress, playerProgress]); // Remove solution from dependencies

  // Add a separate effect to handle solution changes
  useEffect(() => {
    if (gameStatus === "active" && solution.length > 0) {
      setPlayerProgress(Math.min((solution.length / 15) * 100, 95));
    }
  }, [solution, gameStatus]);

  // Hide math background on game completion to improve performance
  useEffect(() => {
    if (gameStatus === "completed") {
      setShowMathBg(false);
    }
  }, [gameStatus]);

  const handleSolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || gameStatus !== "active") return;

    setIsSubmitting(true);

    try {
      // Simulate API call for validation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, let's say the solution is correct if it contains all digits and some operators
      const containsAllDigits = puzzle
        .split("")
        .every((digit) => solution.includes(digit));
      const containsOperators = /[+\-*\/()^]/.test(solution);
      const isCorrect = containsAllDigits && containsOperators;

      setPlayerProgress(100);
      setGameStatus("completed");
      setResult(isCorrect ? "win" : "lose");

      // Update streak if win
      if (isCorrect) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Error validating solution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAgain = () => {
    navigate("/play");
  };

  // Sample equation steps for the solution
  const equationSteps = [
    "1 + (2 + 3 + 4) × (5 + 6)",
    "1 + (9) × (11)",
    "1 + 99",
    "100",
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated math background */}
      {showMathBg && (
        <MathBackground count={40} className="text-gray-800" speed={0.2} />
      )}

      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary-900 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-900 rounded-full opacity-10 blur-3xl" />

      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
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
                className="absolute inset-0 rounded-full border-4 border-primary-500"
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
          <DarkButton
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => navigate("/play")}
            icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
          >
            Back to Lobby
          </DarkButton>

          {streak > 0 && (
            <motion.div
              className="flex items-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <FireIcon className="h-5 w-5 mr-1 animate-pulse" />
              <span className="font-bold">
                <NumberCounter value={streak} duration={0.5} /> Win Streak!
              </span>
            </motion.div>
          )}
        </motion.div>

        <DarkCard className="overflow-visible" variant="primary" border glow>
          {/* Game Header */}
          <DarkCardHeader
            className="relative overflow-hidden"
            variant="primary"
            withAccent
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500 opacity-5 rounded-full -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                  <TrophyIcon className="h-6 w-6 mr-2 text-primary-400" />
                  Hectoc Duel
                </h1>

                <div className="flex items-center space-x-2">
                  <CountdownTimer
                    initialTime={timeLeft}
                    size="lg"
                    warningThreshold={30}
                    dangerThreshold={10}
                    onComplete={() => {
                      if (gameStatus === "active") {
                        setGameStatus("completed");
                        setResult(
                          opponentProgress >= playerProgress ? "lose" : "win"
                        );
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player progress */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      Y
                    </div>
                    <div>
                      <div className="font-medium text-white">You</div>
                      <div className="text-xs text-gray-400">1800</div>
                    </div>
                    <div className="ml-auto text-sm font-medium text-white">
                      <NumberCounter
                        value={playerProgress}
                        formatFn={(val) => `${val}%`}
                      />
                    </div>
                  </div>
                  <ProgressBar
                    progress={playerProgress}
                    color="bg-primary-500"
                    height={6}
                    className="bg-gray-800"
                  />
                </div>

                {/* Opponent progress */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-accent-600 flex items-center justify-center text-white font-bold">
                      {OPPONENT.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {OPPONENT.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {OPPONENT.rating}
                      </div>
                    </div>
                    <div className="ml-auto text-sm font-medium text-white">
                      <NumberCounter
                        value={opponentProgress}
                        formatFn={(val) => `${val}%`}
                      />
                    </div>
                  </div>
                  <ProgressBar
                    progress={opponentProgress}
                    color="bg-accent-500"
                    height={6}
                    className="bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </DarkCardHeader>

          {/* Game Content */}
          <DarkCardBody className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary-400" />
                Your Puzzle:
              </h2>

              <PuzzleDisplay puzzle={puzzle} size="md" className="mb-6" />

              <p className="text-center text-gray-400">
                Insert operations to make the expression equal to 100. Use the
                digits in the given order.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="solution"
                  className="block text-white font-semibold mb-2 flex items-center"
                >
                  <BoltIcon className="h-5 w-5 mr-2 text-primary-400" />
                  Your Solution:
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    id="solution"
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-lg bg-gray-800 text-white"
                    value={solution}
                    onChange={handleSolutionChange}
                    placeholder="e.g., 1+(2+3+4)×(5+6)"
                    disabled={
                      gameStatus === "completed" ||
                      isSubmitting ||
                      showCountdown
                    }
                  />
                  {solution.length > 0 && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setSolution("")}
                      disabled={gameStatus === "completed" || isSubmitting}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Use +, -, *, /, ^, and () to create an expression that
                    equals 100.
                  </p>
                  <button
                    type="button"
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <LightBulbIcon className="h-4 w-4 mr-1" />
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </button>
                </div>

                {/* Hint section */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 bg-gray-800/80 border border-primary-500/30 rounded-md p-3"
                    >
                      <p className="text-sm text-primary-300">
                        <span className="font-medium">Hint:</span> Try grouping
                        some numbers together with parentheses before applying
                        operations.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex space-x-4">
                <DarkButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={
                    isSubmitting || gameStatus === "completed" || showCountdown
                  }
                  glow
                >
                  {isSubmitting ? "Checking..." : "Submit Solution"}
                </DarkButton>
              </div>
            </form>

            {/* Game Result */}
            <AnimatePresence>
              {gameStatus === "completed" && result && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <DarkCard
                    variant={result === "win" ? "primary" : "accent"}
                    className="overflow-hidden"
                  >
                    <DarkCardBody>
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold mb-4 text-white">
                            {result === "win"
                              ? "You won this round!"
                              : "Your opponent won this round."}
                          </h2>

                          <p className="text-gray-300 mb-4">
                            {result === "win"
                              ? "Great job! You solved the puzzle correctly."
                              : "Better luck next time. Keep practicing to improve your skills."}
                          </p>

                          <div className="flex items-center space-x-2 mb-6">
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                result === "win"
                                  ? "bg-green-900/50 text-green-400 border border-green-500/30"
                                  : "bg-red-900/50 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {result === "win" ? "+15 Rating" : "-10 Rating"}
                            </div>

                            {result === "win" && (
                              <div className="px-3 py-1 rounded-full text-sm font-medium bg-primary-900/50 text-primary-400 border border-primary-500/30">
                                +1 Win Streak
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <DarkButton
                              variant="primary"
                              onClick={playAgain}
                              fullWidth
                              icon={<UserGroupIcon className="h-5 w-5" />}
                            >
                              Play Again
                            </DarkButton>
                            <DarkButton
                              variant="ghost"
                              onClick={() => navigate("/leaderboard")}
                              fullWidth
                              icon={<TrophyIcon className="h-5 w-5" />}
                            >
                              Leaderboard
                            </DarkButton>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 w-full md:w-64">
                          <h3 className="font-semibold text-primary-400 mb-3 text-center">
                            Solution
                          </h3>
                          <EquationSolver
                            equation="1+(2+3+4)×(5+6)"
                            steps={["1+(9)×(11)", "1+99"]}
                            result="= 100"
                            className="text-white text-lg"
                            stepDuration={1.2}
                          />
                        </div>
                      </div>
                    </DarkCardBody>
                  </DarkCard>
                </motion.div>
              )}
            </AnimatePresence>
          </DarkCardBody>

          {/* Game Stats Footer */}
          <DarkCardFooter className="px-6 py-4 text-gray-400 text-sm">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 text-primary-400" />
                  <span>Avg. Time: 45s</span>
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1 text-primary-400" />
                  <span>Games Played: 42</span>
                </div>
              </div>
              <div className="flex items-center">
                <TrophyIcon className="h-4 w-4 mr-1 text-primary-400" />
                <span>Win Rate: 67%</span>
              </div>
            </div>
          </DarkCardFooter>
        </DarkCard>
      </div>
    </div>
  );
};

export default DuelGameDark;
