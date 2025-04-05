import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  XCircleIcon,
  UserIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { gameAPI } from "../services/api";
import DuelMatchmaking from "../components/game/DuelMatchmaking.dark";
import { useWebSocket } from "../components/WebSocketProvider";
import { useAuth } from "../hooks/useAuth";
import { Button, Card, CardBody, Toggle } from "../components/ui";
import { FadeIn, ScaleIn } from "../components/animations";
import {
  CountdownTimer,
  ProgressBar,
  GameResult,
  PuzzleDisplay,
} from "../components/game";

// Mock opponent data
const OPPONENT = {
  username: "MathWizard",
  rating: 1850,
  avatar: "M",
};

const DuelGame = () => {
  const { mode = "ranked", gameId } = useParams<{
    mode: string;
    gameId?: string;
  }>();
  const [isRanked, setIsRanked] = useState(mode === "ranked");
  const [currentGameId, setCurrentGameId] = useState<string | undefined>(
    gameId
  );
  const { isAuthenticated, user } = useAuth();
  const { sendMessage } = useWebSocket();
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
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [status, setStatus] = useState<{ state: string; message: string }>({
    state: "waiting",
    message: "Initializing game...",
  });
  // Matchmaking is now handled in the PlayLobby page
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Initialize game and join matchmaking
  useEffect(() => {
    const initGame = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated) {
          console.log("User is not authenticated, redirecting to login");
          navigate("/login");
          return;
        }

        console.log("Using WebSocket for matchmaking status updates");

        // Set up event listeners for WebSocket events
        const handleMatchmakingStatusUpdate = (event: any) => {
          const data = event.detail;
          console.log("Matchmaking status update received:", data);

          // Update the UI with the matchmaking status
          setStatus({
            state: "waiting",
            message: `Waiting for opponent... (${data.time_in_queue || 0}s)`,
          });
        };

        const handleGameCreated = (event: any) => {
          const data = event.detail;
          console.log("Game created event received:", data);

          // Handle game creation
          const newGameId = data.game_id;
          setCurrentGameId(newGameId);

          // Update URL without reloading
          window.history.replaceState(
            null,
            "",
            `/game/duel/${isRanked ? "ranked" : "unranked"}/${newGameId}`
          );

          // If game data is included in the event, use it
          if (data.game_data) {
            setPuzzle(data.game_data.puzzle_sequence);

            // Start countdown
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
          }
        };

        // Add event listeners
        window.addEventListener(
          "matchmaking_status_update",
          handleMatchmakingStatusUpdate
        );
        window.addEventListener("game_created", handleGameCreated);

        // Clean up event listeners when component unmounts
        const cleanup = () => {
          console.log("Cleaning up event listeners");
          window.removeEventListener(
            "matchmaking_status_update",
            handleMatchmakingStatusUpdate
          );
          window.removeEventListener("game_created", handleGameCreated);
        };

        // If we already have a game ID, load that game
        if (currentGameId) {
          const gameResponse = await gameAPI.getGameById(currentGameId);

          if (gameResponse.data.success) {
            const gameData = gameResponse.data.data;
            setPuzzle(gameData.puzzle_sequence);

            // If game is already active, skip countdown
            if (gameData.status === "active") {
              setShowCountdown(false);
              setGameStatus("active");
            } else {
              // Start countdown
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
            }
          }
        } else {
          // Join matchmaking queue
          console.log(
            "Joining matchmaking queue with game_type: duel, ranked:",
            isRanked
          );
          try {
            // Use WebSocket for matchmaking instead of HTTP API
            console.log("Using WebSocket for matchmaking");

            // Show matchmaking UI
            setShowMatchmaking(true);

            // Set status to waiting
            setStatus({
              state: "waiting",
              message: "Waiting for opponent...",
            });

            // Send join queue message via WebSocket
            const joinQueueMessage = {
              type: "join_queue",
              timestamp: Date.now(),
              payload: {
                game_type: "duel",
                ranked: isRanked,
              },
            };

            console.log("Sending WebSocket message:", joinQueueMessage);
            sendMessage(joinQueueMessage);

            // Set up a timeout for matchmaking
            const matchmakingTimeout = setTimeout(() => {
              console.log("Matchmaking timeout reached");

              // Update status to show timeout
              setStatus({
                state: "timeout",
                message: "Matchmaking timeout reached. No opponent found.",
              });

              // Hide matchmaking UI
              setShowMatchmaking(false);

              // Send leave queue message
              const leaveQueueMessage = {
                type: "leave_queue",
              };
              sendMessage(leaveQueueMessage);

              // Show retry button by updating the status
              setStatus({
                state: "retry",
                message: "No opponent found. Would you like to try again?",
              });
            }, 60000); // 60 seconds timeout

            // Set up event listeners for WebSocket events
            const handleMatchmakingStatusUpdate = (event: any) => {
              const data = event.detail;
              console.log("Matchmaking status update received:", data);

              // Update the UI with the matchmaking status
              setStatus({
                state: "waiting",
                message: `Waiting for opponent... (${
                  data.time_in_queue || 0
                }s)`,
              });
            };

            const handleGameCreated = (event: any) => {
              const data = event.detail;
              console.log("Game created event received:", data);

              // Handle game creation
              const newGameId = data.game_id;
              setCurrentGameId(newGameId);

              // Update URL without reloading
              window.history.replaceState(
                null,
                "",
                `/game/duel/${isRanked ? "ranked" : "unranked"}/${newGameId}`
              );

              // If game data is included in the event, use it
              if (data.game_data) {
                setPuzzle(data.game_data.puzzle_sequence);

                // Hide matchmaking UI
                setShowMatchmaking(false);

                // Reset countdown and show it
                setCountdown(3);
                setShowCountdown(true);

                // Start countdown
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
              }
            };

            // Add event listeners
            window.addEventListener(
              "matchmaking_status_update",
              handleMatchmakingStatusUpdate
            );
            window.addEventListener("game_created", handleGameCreated);

            // Return cleanup function
            return () => {
              console.log("Cleaning up event listeners");
              window.removeEventListener(
                "matchmaking_status_update",
                handleMatchmakingStatusUpdate
              );
              window.removeEventListener("game_created", handleGameCreated);

              // Clear the matchmaking timeout
              clearTimeout(matchmakingTimeout);

              // Hide matchmaking UI
              setShowMatchmaking(false);

              // Send leave queue message via WebSocket
              const leaveQueueMessage = {
                type: "leave_queue",
                timestamp: Date.now(),
                payload: {},
              };
              sendMessage(leaveQueueMessage);
            };
          } catch (error) {
            console.error("Error joining matchmaking queue:", error);
            setStatus({
              state: "error",
              message: "Failed to join matchmaking queue. Please try again.",
            });
          }
        }
      } catch (error) {
        console.error("Error initializing game:", error);
        // Fallback to mock data if API fails
        setPuzzle("123456");

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
      }

      // Return a no-op function if we didn't set up any event listeners
      return () => {};
    };

    const cleanupFunction = initGame();

    // Return cleanup function
    return () => {
      if (typeof cleanupFunction === "function") {
        cleanupFunction();
      }
    };
  }, [isRanked, currentGameId, isAuthenticated, navigate]);

  // Focus the input field when the game starts
  useEffect(() => {
    if (gameStatus === "active" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus]);

  // Handle WebSocket messages
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      // Handle match found message
      if (lastMessage.type === "match_found") {
        const payload = lastMessage.payload;
        const newGameId = payload.game_id;

        // Update game ID and URL
        setCurrentGameId(newGameId);
        window.history.replaceState(
          null,
          "",
          `/game/duel/${isRanked ? "ranked" : "unranked"}/${newGameId}`
        );

        // Get game details
        gameAPI
          .getGameById(newGameId)
          .then((response) => {
            if (response.data.success) {
              const gameData = response.data.data;
              setPuzzle(gameData.puzzle_sequence);

              // Start countdown
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
            }
          })
          .catch((error) => {
            console.error("Error getting game details:", error);
          });
      }
    }
  }, [lastMessage, isRanked]);

  // Timer countdown and opponent progress tracking
  useEffect(() => {
    if (gameStatus !== "active" || timeLeft <= 0) return;

    if (!currentGameId) return;

    // Timer for countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);

      // Update player progress based on solution length
      if (solution.length > 0) {
        setPlayerProgress(Math.min((solution.length / 15) * 100, 95));
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
        setGameStatus("completed");
        setResult(opponentProgress >= playerProgress ? "lose" : "win");
      }
    }, 1000);

    // Polling for opponent progress
    const progressInterval = setInterval(async () => {
      try {
        // Get duel status from backend
        const response = await gameAPI.getDuelStatus(currentGameId);

        if (response.data.success) {
          const gameData = response.data.data;

          // Find opponent player
          const opponentPlayer = gameData.players.find((p) => !p.is_self);

          if (opponentPlayer && opponentPlayer.progress !== undefined) {
            // Update opponent progress
            setOpponentProgress(opponentPlayer.progress * 100);

            // Check if opponent has completed
            if (opponentPlayer.progress === 1 && gameStatus === "active") {
              setGameStatus("completed");
              setResult("lose");
            }
          }

          // Check if game is completed
          if (gameData.status === "completed" && gameStatus === "active") {
            setGameStatus("completed");
            const isWinner = gameData.winner_id === gameData.current_user_id;
            setResult(isWinner ? "win" : "lose");
          }
        }
      } catch (error) {
        console.error("Error getting duel status:", error);

        // Fallback to simulated opponent progress if API fails
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
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, [timeLeft, gameStatus, solution, opponentProgress, playerProgress]);

  // Handle mode toggle
  const handleModeToggle = () => {
    const newRanked = !isRanked;
    setIsRanked(newRanked);

    // If we're in a game, just update the URL
    if (currentGameId) {
      const newMode = newRanked ? "ranked" : "unranked";
      window.history.replaceState(
        null,
        "",
        `/game/duel/${newMode}/${currentGameId}`
      );
    } else {
      // If we're not in a game yet, navigate to the new mode
      const newMode = newRanked ? "ranked" : "unranked";
      navigate(`/game/duel/${newMode}`);
    }
  };

  const handleSolutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolution(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || gameStatus !== "active") return;

    setIsSubmitting(true);

    try {
      if (!currentGameId) {
        throw new Error("Game ID not found");
      }

      // Submit solution to the backend
      const response = await gameAPI.submitSolution(currentGameId, solution);

      if (response.data.success) {
        const gameData = response.data.data;

        // Update game state based on response
        setPlayerProgress(100);

        // Check if the game is completed
        if (gameData.status === "completed") {
          setGameStatus("completed");

          // Determine result
          const isWinner = gameData.winner_id === gameData.current_user_id;
          setResult(isWinner ? "win" : "lose");

          // Update streak if win
          if (isWinner) {
            setStreak((prev) => prev + 1);
          } else {
            setStreak(0);
          }
        }
      } else {
        // Handle error response
        console.error("Error submitting solution:", response.data.message);
      }
    } catch (error) {
      console.error("Error submitting solution:", error);

      // Fallback to mock behavior if API fails
      setPlayerProgress(100);
      setGameStatus("completed");
      setResult(Math.random() > 0.5 ? "win" : "lose");
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAgain = () => {
    // Leave the current queue if any
    if (currentGameId) {
      try {
        matchmakingAPI.leaveQueue();
      } catch (error) {
        console.error("Error leaving queue:", error);
      }
    }

    // Navigate to the game mode selection
    navigate(`/game/duel/${isRanked ? "ranked" : "unranked"}`);
    // Reload the page to reset the game state
    window.location.reload();
  };

  // Calculate time color based on remaining time
  const getTimeColor = () => {
    if (timeLeft > 30) return "text-green-600";
    if (timeLeft > 10) return "text-yellow-600";
    return "text-red-600";
  };

  // Get theme colors based on mode
  const getThemeColors = () => {
    return isRanked
      ? {
          primary: "primary",
          gradient: "from-primary-600 to-primary-800",
          accent: "accent-500",
          button: "bg-primary-600 hover:bg-primary-700",
          border: "border-primary-700/30",
          bg: "bg-primary-900/50",
          text: "text-primary-300",
        }
      : {
          primary: "blue",
          gradient: "from-blue-600 to-blue-800",
          accent: "blue-500",
          button: "bg-blue-600 hover:bg-blue-700",
          border: "border-blue-700/30",
          bg: "bg-blue-900/50",
          text: "text-blue-300",
        };
  };

  const theme = getThemeColors();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Matchmaking is now handled in the PlayLobby page */}
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

          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 p-2 rounded-lg shadow-sm">
            <button
              onClick={() => setIsRanked(true)}
              className={`px-4 py-2 rounded-md transition-all ${
                isRanked
                  ? "bg-primary-600 text-white font-medium shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center">
                <TrophyIcon className="h-4 w-4 mr-2" />
                Ranked
              </span>
            </button>
            <button
              onClick={() => setIsRanked(false)}
              className={`px-4 py-2 rounded-md transition-all ${
                !isRanked
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Unranked
              </span>
            </button>
          </div>

          {streak > 0 && (
            <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full">
              <FireIcon className="h-5 w-5 mr-1 animate-pulse" />
              <span className="font-bold">{streak} Win Streak!</span>
            </div>
          )}
        </div>

        <Card className="overflow-visible">
          {/* Game Header */}
          <div
            className={`bg-gradient-to-r ${theme.gradient} p-6 text-white relative overflow-hidden`}
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                  <TrophyIcon className="h-6 w-6 mr-2" />
                  {isRanked ? "Ranked Duel" : "Unranked Duel"}
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
                    <div
                      className={`h-8 w-8 rounded-full bg-${theme.accent} flex items-center justify-center text-white font-bold`}
                    >
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
                    color={`bg-${theme.accent}`}
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
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-gray-700 text-sm">
                    Target: <span className="font-bold">100</span>
                  </div>

                  <div
                    className={`text-sm ${
                      timeLeft < 30 ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    Time Remaining:{" "}
                    <span className="font-bold">
                      {Math.floor(timeLeft / 60)}:
                      {(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <PuzzleDisplay
                  puzzle={puzzle}
                  size="md"
                  animated={true}
                  className="mb-4"
                />

                <p className="text-center text-gray-600 text-sm">
                  Use all six numbers exactly once with basic operations (+, -,
                  *, /) to reach 100.
                </p>
              </div>
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
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-${theme.primary}-500 font-mono text-lg`}
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
                    className={`text-${theme.primary}-600 hover:text-${theme.primary}-700 text-sm flex items-center`}
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
                  variant={isRanked ? "primary" : "secondary"}
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
                  ratingChange={
                    isRanked ? (result === "win" ? 15 : -10) : undefined
                  }
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
