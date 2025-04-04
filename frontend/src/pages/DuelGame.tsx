import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  XCircleIcon,
  UserIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Button, Card, CardBody } from "../components/ui";
import { FadeIn, ScaleIn } from "../components/animations";
import { CountdownTimer, ProgressBar, GameResult } from "../components/game";

// Mock opponent data
const OPPONENT = {
  username: "MathWizard",
  rating: 1850,
  avatar: "M",
};

const DuelGame = () => {
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
      if (solution.length > 0) {
        setPlayerProgress(Math.min((solution.length / 15) * 100, 95));
      }
    }, 1000);

    if (timeLeft === 0) {
      setGameStatus("completed");
      setResult(opponentProgress >= playerProgress ? "lose" : "win");
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, solution, opponentProgress, playerProgress]);

  // Trigger confetti when player wins
  useEffect(() => {
    if (result === "win") {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [result]);

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

  // Calculate time color based on remaining time
  const getTimeColor = () => {
    if (timeLeft > 30) return "text-green-600";
    if (timeLeft > 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
              className="text-white text-8xl font-bold"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeIn className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-gray-600"
            onClick={() => navigate("/play")}
            icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
          >
            Back to Lobby
          </Button>

          {streak > 0 && (
            <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full">
              <FireIcon className="h-5 w-5 mr-1 animate-pulse" />
              <span className="font-bold">{streak} Win Streak!</span>
            </div>
          )}
        </div>

        <Card className="overflow-visible">
          {/* Game Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                  <TrophyIcon className="h-6 w-6 mr-2" />
                  Hectoc Duel
                </h1>
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

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player progress */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                      Y
                    </div>
                    <div>
                      <div className="font-medium">You</div>
                      <div className="text-xs text-gray-200">1800</div>
                    </div>
                    <div className="ml-auto text-sm font-medium">
                      {playerProgress}%
                    </div>
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
                      <div className="font-medium">{OPPONENT.username}</div>
                      <div className="text-xs text-gray-200">
                        {OPPONENT.rating}
                      </div>
                    </div>
                    <div className="ml-auto text-sm font-medium">
                      {opponentProgress}%
                    </div>
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
          </div>

          {/* Game Content */}
          <CardBody className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Your Puzzle:
              </h2>
              <PuzzleDisplay puzzle={puzzle} size="md" className="mb-6" />
              <p className="text-center text-gray-600">
                Insert operations to make the expression equal to 100. Use the
                digits in the given order.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="solution"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Your Solution:
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    id="solution"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-lg"
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSolution("")}
                      disabled={gameStatus === "completed" || isSubmitting}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Use +, -, *, /, ^, and () to create an expression that
                    equals 100.
                  </p>
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
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
                      className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3"
                    >
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Hint:</span> Try grouping
                        some numbers together with parentheses before applying
                        operations.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={
                    isSubmitting || gameStatus === "completed" || showCountdown
                  }
                >
                  {isSubmitting ? "Checking..." : "Submit Solution"}
                </Button>
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
                  ratingChange={result === "win" ? 15 : -10}
                />
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </FadeIn>
    </div>
  );
};

export default DuelGame;
