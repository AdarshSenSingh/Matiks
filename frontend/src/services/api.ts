import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Add a flag to prevent infinite refresh loops
let isRefreshing = false;

// Modify your API interceptor to handle auth errors better
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt to refresh if we're already on login-related endpoints
    const isAuthEndpoint = originalRequest.url.includes("/auth/");
    const isLoginPage = window.location.pathname === "/login";

    // Only attempt to refresh token once and only for 401 errors
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      !isLoginPage &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authAPI.refreshToken();
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Only redirect if we're not already on login page
        if (!isLoginPage) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post("/auth/register", { username, email, password }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/me"),
};

// Game API
export const gameAPI = {
  createGame: (gameType: string) => api.post("/games", { game_type: gameType }),

  joinGame: (gameId: string) => api.post(`/games/${gameId}/join`),

  submitSolution: (gameId: string, solution: string) =>
    api.post(`/games/${gameId}/submit`, { solution }),

  getActiveGames: () => api.get("/games/active"),

  getGameById: (gameId: string) => api.get(`/games/${gameId}`),

  getDuelStatus: (gameId: string) => api.get(`/games/${gameId}/duel`),
};

// Matchmaking API
export const matchmakingAPI = {
  joinQueue: async (gameType: string, isRanked: boolean = true) => {
    console.log("API call: joinQueue", {
      game_type: gameType,
      ranked: isRanked,
    });
    try {
      // Log the request details
      const requestData = {
        game_type: gameType,
        ranked: isRanked,
      };
      console.log("Request data:", JSON.stringify(requestData));

      const response = await api.post("/matchmaking/queue", requestData);
      console.log("Response:", response.data);
      return response;
    } catch (error: any) {
      console.error("Error in joinQueue API call:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      throw error;
    }
  },

  leaveQueue: () => api.delete("/matchmaking/queue"),

  getQueueStatus: () => api.get("/matchmaking/queue/status"),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: () => api.get("/leaderboard"),

  getUserStats: (userId: string) => api.get(`/leaderboard/user/${userId}`),
};

export default api;
