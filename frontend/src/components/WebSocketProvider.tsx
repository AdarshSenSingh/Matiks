import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";

interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: any) => void;
  lastMessage: any;
  readyState: number;
  gameState: any;
  matchmakingStatus: any;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Choose endpoint based on authentication status
    const endpoint = isAuthenticated ? "ws/auth" : "ws/connect";

    // Always connect directly to the backend server
    // This bypasses the Vite proxy which is causing issues
    const wsUrl = `${protocol}//localhost:8080/${endpoint}`;

    console.log("Connecting to WebSocket at:", wsUrl);
    const ws = new WebSocket(wsUrl);

    // Set up event listeners
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setReadyState(WebSocket.OPEN);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle different message types
        if (data.type === "game_state") {
          // Game state update
          console.log("Game state update received:", data);
          setGameState(data);

          // Dispatch a custom event that components can listen for
          window.dispatchEvent(
            new CustomEvent("game_state_update", { detail: data })
          );
        } else if (data.type === "matchmaking_status") {
          // Matchmaking status update
          console.log("Matchmaking status update received:", data);
          setMatchmakingStatus(data);

          // Dispatch a custom event that components can listen for
          window.dispatchEvent(
            new CustomEvent("matchmaking_status_update", { detail: data })
          );
        } else if (data.type === "game_created") {
          // Game created notification
          console.log("Game created notification received:", data);
          setGameState(data);

          // Dispatch a custom event that components can listen for
          window.dispatchEvent(
            new CustomEvent("game_created", { detail: data })
          );
        } else if (data.type === "error") {
          // Error message
          console.error("Error message received:", data);

          // Dispatch a custom event that components can listen for
          window.dispatchEvent(
            new CustomEvent("error_message", { detail: data.payload })
          );
        } else if (
          data.type === "practice_start" ||
          data.type === "practice_end" ||
          data.type === "practice_next_puzzle" ||
          data.type === "practice_submit_solution" ||
          data.type === "practice_result"
        ) {
          // Practice mode messages - these are handled by the usePracticeWebSocket hook
          console.log("Practice mode message received:", data);
        }

        setLastMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);

      // Don't try to reconnect automatically on error
      // Just set the readyState to CLOSED
      setReadyState(WebSocket.CLOSED);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      setReadyState(WebSocket.CLOSED);
    };

    // Save the socket
    setSocket(ws);

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [isAuthenticated]);

  // Function to send messages
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        sendMessage,
        lastMessage,
        readyState,
        gameState,
        matchmakingStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
