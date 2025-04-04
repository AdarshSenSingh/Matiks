import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * A wrapper component that redirects to login if the user is not authenticated
 */
const ProtectedRoute = ({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show nothing while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Add a flag to indicate this is a redirect from a protected route
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location, isProtectedRedirect: true }}
        replace
      />
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
