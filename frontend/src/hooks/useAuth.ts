import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to access authentication context
 * @returns Authentication context with user data and auth methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

/**
 * Higher-order function to create a wrapper that handles authentication errors
 * @param fn The function to wrap
 * @returns A wrapped function that handles errors
 */
export const withAuthErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      // Handle specific authentication errors here
      console.error("Authentication error:", error.message);
      throw error;
    }
  };
};
