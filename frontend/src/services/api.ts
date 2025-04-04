import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
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
    const isAuthEndpoint = originalRequest.url.includes('/auth/');
    const isLoginPage = window.location.pathname === '/login';
    
    // Only attempt to refresh token once and only for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing && !isLoginPage && !isAuthEndpoint) {
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
          window.location.href = '/login';
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
    api.post('/auth/register', { username, email, password }),
  
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/me'),
};

// Game API
export const gameAPI = {
  createGame: () => 
    api.post('/games/create'),
  
  joinGame: (gameId: string) => 
    api.post(`/games/${gameId}/join`),
  
  submitSolution: (gameId: string, solution: string) => 
    api.post(`/games/${gameId}/submit-solution`, { solution }),
  
  getActiveGames: () => 
    api.get('/games/active'),
  
  getGameById: (gameId: string) => 
    api.get(`/games/${gameId}`),
};

// Matchmaking API
export const matchmakingAPI = {
  joinQueue: () => 
    api.post('/matchmaking/queue'),
  
  leaveQueue: () => 
    api.delete('/matchmaking/queue'),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: () => 
    api.get('/leaderboard'),
  
  getUserStats: (userId: string) => 
    api.get(`/leaderboard/user/${userId}`),
};

export default api;
