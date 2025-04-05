import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PuzzleDisplay from "../components/PuzzleDisplay";
import SolutionInput from "../components/SolutionInput";
import ProgressIndicator from "../components/ProgressIndicator";
import GameResults from "../components/GameResults";
import { motion } from "framer-motion";
import usePracticeWebSocket from "../hooks/usePracticeWebSocket";
import { useAuth } from "../hooks/useAuth";

interface Player {
  id: string;
  username: string;
  progress: number;
  isCorrect?: boolean;
  score?: number;
  solutionTime?: number;
  solution?: string;
  isSelf?: boolean;
}

interface GameState {
  id: string;
  status: "waiting" | "active" | "completed";
  sequence: string;
  target: number;
  startTime?: number;
  endTime?: number;
  players: Player[];
}

const PracticeGame: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Practice mode options
  const [timedMode, setTimedMode] = useState<boolean>(false);

  // Use the practice WebSocket hook
  const {
    session,
    currentPuzzle,
    lastResult,
    isLoading,
    error,
    startPractice,
    submitSolution,
    endPractice,
  } = usePracticeWebSocket();

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Convert to game state format for existing components
  const gameState: GameState = {
    id: session?.id || "practice-waiting",
    status: !session
      ? "waiting"
      : session.status === "active"
      ? "active"
      : "completed",
    sequence: currentPuzzle?.sequence || "123456",
    target: 100,
    players: [
      {
        id: user?.id || "guest",
        username: user?.username || "You",
        progress:
          session?.status === "active"
            ? 0.5
            : session?.status === "completed"
            ? 1
            : 0,
        isCorrect: lastResult?.isCorrect,
        score: lastResult?.score,
        isSelf: true,
      },
    ],
  };

  // Handle solution submission
  const handleSubmitSolution = useCallback(
    (solution: string) => {
      submitSolution(solution);
    },
    [submitSolution]
  );

  // Start the practice session
  const handleStartPractice = useCallback(() => {
    startPractice({ timedMode });
  }, [startPractice, timedMode]);

  // Auto-start practice if URL has autostart parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autostart = urlParams.get("autostart");
    if (autostart === "true") {
      handleStartPractice();
    }
  }, [handleStartPractice]);

  // Update timer when game is active and in timed mode
  useEffect(() => {
    if (gameState.status === "active" && currentPuzzle?.timeLimit) {
      // Initialize timer
      setTimeRemaining(currentPuzzle.timeLimit);

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.status, currentPuzzle]);

  // Handle play again
  const handlePlayAgain = () => {
    startPractice({ timedMode });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (session?.status === "active") {
        endPractice("component_unmounted");
      }
    };
  }, [session, endPractice]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Practice Mode
      </h1>

      {!session && (
        <div className="bg-gray-800 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 text-white">
            Practice Settings
          </h2>

          <div className="mb-6">
            <label className="flex items-center space-x-3 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={timedMode}
                onChange={() => setTimedMode(!timedMode)}
                className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span>Timed Mode (60 seconds per puzzle)</span>
            </label>
            <p className="text-gray-400 text-sm mt-2">
              {timedMode
                ? "You'll have 60 seconds to solve each puzzle. If time runs out, the session ends."
                : "Take your time to solve each puzzle. No time limit."}
            </p>
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg"
              onClick={handleStartPractice}
              disabled={isLoading}
            >
              {isLoading ? "Starting..." : "Start Practice"}
            </motion.button>
          </div>
        </div>
      )}

      {session && (
        <>
          <div className="bg-gray-800 rounded-xl p-4 mb-4 flex justify-between items-center">
            <div>
              <span className="text-gray-400">Mode:</span>
              <span className="ml-2 text-white font-medium">
                {timedMode ? "Timed" : "Untimed"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">ELO Rating:</span>
              <span className="ml-2 text-white font-medium">
                {session.currentELO}
              </span>
              {lastResult?.ratingChange && (
                <span
                  className={`ml-2 ${
                    lastResult.ratingChange > 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {lastResult.ratingChange > 0 ? "+" : ""}
                  {lastResult.ratingChange}
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-400">Puzzles Solved:</span>
              <span className="ml-2 text-white font-medium">
                {session.puzzlesSolved}
              </span>
            </div>
          </div>

          <PuzzleDisplay
            sequence={gameState.sequence}
            target={gameState.target}
            timeRemaining={timeRemaining}
            isActive={gameState.status === "active"}
          />

          <ProgressIndicator players={gameState.players} gameMode="practice" />

          {gameState.status === "active" && (
            <SolutionInput
              onSubmit={handleSubmitSolution}
              isActive={gameState.status === "active"}
              sequence={gameState.sequence}
            />
          )}

          {gameState.status === "completed" && (
            <GameResults
              players={gameState.players}
              gameMode="practice"
              sequence={gameState.sequence}
              target={gameState.target}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </>
      )}

      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6 max-w-md mx-auto">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 text-center">
        {session && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg mr-4"
            onClick={() => endPractice("user_ended")}
          >
            End Practice
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold shadow-lg"
          onClick={() => navigate("/game")}
        >
          Back to Game Selection
        </motion.button>
      </div>
    </div>
  );
};

export default PracticeGame;
