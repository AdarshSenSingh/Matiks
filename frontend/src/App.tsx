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

// Pages
import Home from "./pages/Home.dark";
import Login from "./pages/Login.dark";
import Register from "./pages/Register.dark";
import Game from "./pages/Game";
import DuelGame from "./pages/DuelGame.dark";
import PlayLobby from "./pages/PlayLobby.dark";
import Leaderboard from "./pages/Leaderboard.dark";
import Profile from "./pages/Profile.dark";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
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
    </Router>
  );
}

export default App;
