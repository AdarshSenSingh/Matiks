import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const Game = () => {
  const [puzzle, setPuzzle] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "completed"
  >("waiting");
  const [opponentProgress, setOpponentProgress] = useState<number>(0);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a random puzzle
  useEffect(() => {
    // This is a placeholder for the actual puzzle generation
    const generatePuzzle = () => {
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += Math.floor(Math.random() * 9) + 1;
      }
      return result;
    };

    setPuzzle(generatePuzzle());
    setGameStatus("active");

    // Focus the input field when the game starts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Timer countdown
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

  const handleSolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || gameStatus !== "active") return;

    setIsSubmitting(true);

    try {
      // TODO: Implement actual solution validation
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
    } catch (error) {
      console.error("Error validating solution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetGame = () => {
    // Generate a new puzzle
    const generatePuzzle = () => {
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += Math.floor(Math.random() * 9) + 1;
      }
      return result;
    };

    setPuzzle(generatePuzzle());
    setSolution("");
    setTimeLeft(60);
    setGameStatus("active");
    setOpponentProgress(0);
    setPlayerProgress(0);
    setResult(null);

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Calculate time color based on remaining time
  const getTimeColor = () => {
    if (timeLeft > 30) return "text-green-600";
    if (timeLeft > 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Game Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">Hectoc Duel</h1>
              <div
                className={`flex items-center space-x-2 text-xl font-bold ${getTimeColor()}`}
              >
                <ClockIcon className="h-6 w-6" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 text-sm font-medium mb-1">
                  <UserIcon className="h-4 w-4" />
                  <span>You</span>
                  <span className="ml-auto">{playerProgress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
                  <motion.div
                    className="bg-accent-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${playerProgress}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-sm font-medium mb-1">
                  <UserIcon className="h-4 w-4" />
                  <span>Opponent</span>
                  <span className="ml-auto">{opponentProgress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
                  <motion.div
                    className="bg-secondary-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${opponentProgress}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Your Puzzle:
              </h2>
              <div className="flex justify-center space-x-3 mb-6">
                {puzzle.split("").map((digit, index) => (
                  <motion.div
                    key={index}
                    className="w-14 h-14 flex items-center justify-center bg-primary-100 rounded-lg text-2xl font-bold text-primary-800 shadow-sm"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {digit}
                  </motion.div>
                ))}
              </div>
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
                    disabled={gameStatus === "completed" || isSubmitting}
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
                <p className="mt-2 text-sm text-gray-500">
                  Use +, -, *, /, ^, and () to create an expression that equals
                  100.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className={`flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ${
                    isSubmitting || gameStatus === "completed"
                      ? "bg-primary-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                  disabled={isSubmitting || gameStatus === "completed"}
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Checking...
                    </>
                  ) : (
                    "Submit Solution"
                  )}
                </button>

                {gameStatus === "completed" && (
                  <button
                    type="button"
                    onClick={resetGame}
                    className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
                  >
                    Play Again
                  </button>
                )}
              </div>
            </form>

            {/* Game Result */}
            <AnimatePresence>
              {gameStatus === "completed" && result && (
                <motion.div
                  className={`mt-8 p-6 rounded-lg ${
                    result === "win"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start">
                    {result === "win" ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold mb-2">
                        {result === "win"
                          ? "You won this round!"
                          : "Your opponent won this round."}
                      </h2>
                      <p className="text-gray-600">
                        {result === "win"
                          ? "Great job! You solved the puzzle correctly."
                          : "Better luck next time. Keep practicing to improve your skills."}
                      </p>

                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Optimal solution:
                        </h3>
                        <p className="font-mono text-lg">
                          1+(2+3+4)×(5+6) = 100
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          = 1+9×11 = 1+99 = 100
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Game Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            How to Play Hectoc
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Use all six digits in the given order (no rearranging)</li>
            <li>
              Insert mathematical operations between digits to make the
              expression equal to 100
            </li>
            <li>
              Allowed operations: addition (+), subtraction (-), multiplication
              (*), division (/), exponentiation (^), and parentheses ()
            </li>
            <li>The first player to find a correct solution wins</li>
            <li>If time runs out, the player with more progress wins</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Game;
