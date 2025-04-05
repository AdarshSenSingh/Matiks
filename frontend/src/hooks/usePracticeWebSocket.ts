import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "../components/WebSocketProvider";

interface PracticeConfig {
  timedMode: boolean;
  startELO?: number;
}

interface PracticeSession {
  id: string;
  currentELO: number;
  puzzlesSolved: number;
  status: "active" | "completed" | "failed";
}

interface PuzzleData {
  sequence: string;
  difficulty: number;
  timeLimit?: number; // in seconds, only for timed mode
}

interface SolutionResult {
  isCorrect: boolean;
  score?: number;
  ratingChange?: number;
  nextPuzzle?: string;
  nextDifficulty?: number;
  timeLimit?: number; // in seconds, only for timed mode
}

const usePracticeWebSocket = () => {
  const { socket, sendMessage, readyState } = useWebSocket();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);
  const [lastResult, setLastResult] = useState<SolutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Practice WebSocket message received:", data);

        switch (data.type) {
          case "practice_next_puzzle":
            const puzzlePayload = JSON.parse(data.payload);
            setSession({
              id: puzzlePayload.session_id,
              currentELO: puzzlePayload.current_elo,
              puzzlesSolved: puzzlePayload.puzzles_solved,
              status: "active",
            });
            setCurrentPuzzle({
              sequence: puzzlePayload.puzzle,
              difficulty: puzzlePayload.difficulty,
              timeLimit: puzzlePayload.time_limit,
            });
            setIsLoading(false);
            break;

          case "practice_result":
            const resultPayload = JSON.parse(data.payload);
            setLastResult({
              isCorrect: resultPayload.is_correct,
              score: resultPayload.score,
              ratingChange: resultPayload.rating_change,
              nextPuzzle: resultPayload.next_puzzle,
              nextDifficulty: resultPayload.next_difficulty,
              timeLimit: resultPayload.time_limit,
            });

            // Update session
            setSession({
              id: resultPayload.session_id,
              currentELO: resultPayload.current_elo,
              puzzlesSolved: resultPayload.puzzles_solved,
              status: resultPayload.status,
            });

            // If there's a next puzzle, update it
            if (resultPayload.next_puzzle) {
              setCurrentPuzzle({
                sequence: resultPayload.next_puzzle,
                difficulty: resultPayload.next_difficulty,
                timeLimit: resultPayload.time_limit,
              });
            }

            setIsLoading(false);
            break;

          case "practice_end":
            const endPayload = JSON.parse(data.payload);
            setSession((prev) =>
              prev ? { ...prev, status: "completed" } : null
            );
            setIsLoading(false);
            break;

          case "error":
            const errorPayload = JSON.parse(data.payload);
            setError(errorPayload.message);
            setIsLoading(false);
            break;
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  // Start a practice session
  const startPractice = useCallback(
    (config: PracticeConfig) => {
      if (readyState !== WebSocket.OPEN) {
        setError("WebSocket is not connected");
        return;
      }

      setIsLoading(true);
      setError(null);
      setLastResult(null);

      sendMessage({
        type: "practice_start",
        timestamp: Date.now(),
        payload: {
          timed_mode: config.timedMode,
          start_elo: config.startELO,
        },
      });
    },
    [readyState, sendMessage]
  );

  // Submit a solution
  const submitSolution = useCallback(
    (solution: string) => {
      if (!session) {
        setError("No active practice session");
        return;
      }

      if (readyState !== WebSocket.OPEN) {
        setError("WebSocket is not connected");
        return;
      }

      setIsLoading(true);
      setError(null);

      sendMessage({
        type: "practice_submit_solution",
        timestamp: Date.now(),
        payload: {
          session_id: session.id,
          solution,
        },
      });
    },
    [session, readyState, sendMessage]
  );

  // End a practice session
  const endPractice = useCallback(
    (reason?: string) => {
      if (!session) {
        return;
      }

      if (readyState !== WebSocket.OPEN) {
        setError("WebSocket is not connected");
        return;
      }

      setIsLoading(true);

      sendMessage({
        type: "practice_end",
        timestamp: Date.now(),
        payload: {
          session_id: session.id,
          reason: reason || "user_ended",
        },
      });
    },
    [session, readyState, sendMessage]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (session && session.status === "active") {
        endPractice("component_unmounted");
      }
    };
  }, [session, endPractice]);

  return {
    session,
    currentPuzzle,
    lastResult,
    isLoading,
    error,
    startPractice,
    submitSolution,
    endPractice,
  };
};

export default usePracticeWebSocket;
