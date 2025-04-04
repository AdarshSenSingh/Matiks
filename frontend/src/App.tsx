import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Components
import Navbar from "./components/Navbar.enhanced";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import GameModeSelection from "./components/GameModeSelection";

// Pages
import Home from "./pages/Home.dark";
import Login from "./pages/Login.dark";
import Register from "./pages/Register.dark";
import Game from "./pages/Game";
import DuelGame from "./pages/DuelGame.merged";
import PracticeGame from "./pages/PracticeGame";
import DailyChallenge from "./pages/DailyChallenge";
import PlayLobby from "./pages/PlayLobby.dark";
import Leaderboard from "./pages/Leaderboard.dark";
import Profile from "./pages/Profile.dark";

// Import WebSocketProvider
import WebSocketProvider from "./components/WebSocketProvider";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <WebSocketProvider>
        <div className="flex flex-col min-h-screen bg-gray-950">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <Login />
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <Register />
                }
              />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Game mode selection */}
              <Route path="/game" element={<GameModeSelection />} />

              {/* Game modes */}
              <Route path="/game/duel/:mode" element={<DuelGame />} />
              <Route path="/game/duel/:mode/:gameId" element={<DuelGame />} />
              <Route path="/game/practice" element={<PracticeGame />} />
              <Route path="/game/daily" element={<DailyChallenge />} />

              {/* Protected routes */}
              <Route
                path="/play"
                element={
                  <ProtectedRoute>
                    <PlayLobby />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/play/practice"
                element={
                  <ProtectedRoute>
                    <Game />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/play/duel"
                element={
                  <ProtectedRoute>
                    <DuelGame />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </WebSocketProvider>
    </Router>
  );
}

export default App;
