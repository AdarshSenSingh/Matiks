import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { get, post } from "../utils/http";

interface User {
  id: string;
  username: string;
  email: string;
  rating: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<User | null>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  authLocked: boolean;
  authFailureCount: number;
}

const initialAuthContext: AuthContextType = {
  user: null,
  loading: false,
  error: null,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  clearError: () => {},
  isAuthenticated: false,
  authLocked: false,
  authFailureCount: 0,
};

export const AuthContext = createContext<AuthContextType>(initialAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [authFailureCount, setAuthFailureCount] = useState<number>(0);
  const [authLocked, setAuthLocked] = useState<boolean>(false);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen for auth:logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login page
      window.location.href = "/login";
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  // Track user activity to maintain session
  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
    };

    // Update last activity on user interactions
    window.addEventListener("mousemove", updateLastActivity);
    window.addEventListener("keypress", updateLastActivity);
    window.addEventListener("click", updateLastActivity);
    window.addEventListener("scroll", updateLastActivity);

    return () => {
      window.removeEventListener("mousemove", updateLastActivity);
      window.removeEventListener("keypress", updateLastActivity);
      window.removeEventListener("click", updateLastActivity);
      window.removeEventListener("scroll", updateLastActivity);
    };
  }, []);

  // Define logout function first (will be used in useEffect)
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      // Clear any stored tokens or session data
      localStorage.removeItem("auth_session");
      sessionStorage.removeItem("auth_session");
    } catch (error: any) {
      // Even if the API call fails, we should still clear the local state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("auth_session");
      sessionStorage.removeItem("auth_session");

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to logout. Please try again.";
      setError(errorMessage);
      console.error("Logout error:", errorMessage);
      // Don't throw here - we want to ensure the user is logged out locally
    } finally {
      setLoading(false);
    }
  };

  // Session timeout check
  useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const intervalId = setInterval(() => {
      if (isAuthenticated && Date.now() - lastActivity > SESSION_TIMEOUT) {
        // Session timeout - log the user out
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [isAuthenticated, lastActivity, logout]);

  // Reset auth failure count after a successful operation
  const resetAuthFailures = useCallback(() => {
    setAuthFailureCount(0);
    setAuthLocked(false);
  }, []);

  // Increment auth failure count and lock if needed
  const handleAuthFailure = useCallback(() => {
    setAuthFailureCount((prev) => {
      const newCount = prev + 1;
      // Lock auth after 3 consecutive failures
      if (newCount >= 3) {
        setAuthLocked(true);
        // Reset after 10 seconds to allow retry
        setTimeout(() => {
          setAuthFailureCount(0);
          setAuthLocked(false);
        }, 10000);
      }
      return newCount;
    });
  }, []);

  // Check if user is already logged in
  const checkAuthStatus = useCallback(async () => {
    // Skip if auth is locked due to too many failures
    if (authLocked) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if we have stored user info for quick loading
      const storedUserInfo = localStorage.getItem("user_info");
      const isRemembered = localStorage.getItem("auth_remember") === "true";

      if (storedUserInfo && isRemembered) {
        // Set a temporary user state while we verify with the server
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUser({
          id: parsedUserInfo.id,
          username: parsedUserInfo.username,
          email: "", // Will be filled in by the server response
          rating: 0, // Will be filled in by the server response
          ...parsedUserInfo,
        } as User);
        setIsAuthenticated(true);
      }

      // Always verify with the server
      const response = await get<User>("/auth/me");
      setUser(response);
      setIsAuthenticated(true);
      setLastActivity(Date.now());
      resetAuthFailures(); // Reset failure count on success

      // Update stored user info if remember me is enabled
      if (isRemembered) {
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            id: response.id,
            username: response.username,
            lastLogin: new Date().toISOString(),
          })
        );
      }
    } catch (error) {
      // User is not logged in, that's okay
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user_info");
      handleAuthFailure(); // Increment failure count
    } finally {
      setLoading(false);
    }
  }, [authLocked, resetAuthFailures, handleAuthFailure]);

  // Get current location to determine if we're on a public page
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : ""
  );

  // Update path when it changes
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for path changes
    window.addEventListener("popstate", updatePath);

    // Initial check
    updatePath();

    return () => {
      window.removeEventListener("popstate", updatePath);
    };
  }, []);

  // Skip auth check on public pages
  const isPublicPage = useMemo(() => {
    const publicPaths = ["/login", "/register"];
    return publicPaths.some((path) => currentPath.startsWith(path));
  }, [currentPath]);

  useEffect(() => {
    // Skip authentication check on public pages
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    checkAuthStatus();
  }, [checkAuthStatus, isPublicPage]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Store the remember me preference in local storage
      if (rememberMe) {
        localStorage.setItem("auth_remember", "true");
      } else {
        localStorage.removeItem("auth_remember");
      }

      const response = await post<User>("/auth/login", {
        email,
        password,
        rememberMe,
      });

      setUser(response);
      setIsAuthenticated(true);
      setLastActivity(Date.now());

      // Store minimal user info for quick restoration on page refresh
      if (rememberMe) {
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            id: response.id,
            username: response.username,
            lastLogin: new Date().toISOString(),
          })
        );
      }

      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to login. Please check your credentials.";
      setError(errorMessage);

      // Log the error for debugging
      console.error("Login error:", error);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await post<User>("/auth/register", {
        username,
        email,
        password,
      });
      setUser(response);
      setIsAuthenticated(true);
      setLastActivity(Date.now());
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to register. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated,
        authLocked,
        authFailureCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
