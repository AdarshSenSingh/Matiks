import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { DarkButton, DarkCard, DarkCardBody } from "../components/ui";
import { MathBackground, AnimatedText } from "../components/animations";
import { useAuth } from "../hooks/useAuth";

const LoginDark = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const {
    login,
    loading: isLoading,
    error: authError,
    clearError,
    authLocked,
    authFailureCount,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to /play
  const from = location.state?.from?.pathname || "/play";

  // Check if this is a redirect from a protected route
  const isProtectedRedirect = location.state?.isProtectedRedirect || false;

  // Skip authentication checks if this is not a protected redirect
  useEffect(() => {
    if (!isProtectedRedirect) {
      // Clear any auth errors that might be showing
      clearError();
    }
  }, [isProtectedRedirect, clearError]);

  // Clear auth errors when component unmounts or when inputs change
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Set local error state when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password, rememberMe);
      // If login is successful, navigate to the redirect path
      if (result) {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      // Error is handled by the auth context and set to authError
      console.error("Login error:", error);
      // Show a more user-friendly error message
      setError(
        error.message ||
          "Failed to login. Please check your credentials and try again."
      );
    }
  };

  // Check if remember me was previously enabled
  useEffect(() => {
    const remembered = localStorage.getItem("auth_remember") === "true";
    setRememberMe(remembered);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated math background */}
      <MathBackground count={30} className="text-gray-800" speed={0.2} />

      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary-900 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-900 rounded-full opacity-10 blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/">
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl font-bold text-white">
              Hecto<span className="text-primary-500">Clash</span>
            </span>
          </motion.div>
        </Link>

        <AnimatedText
          text="Welcome Back"
          type="words"
          animationType="fade"
          className="mt-6 text-center text-3xl font-bold text-white"
          tag="h2"
        />
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to your account to continue your math journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <DarkCard>
          <DarkCardBody>
            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 flex items-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {authLocked && (
              <motion.div
                className="mb-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg text-amber-400 flex items-start"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>
                    Too many failed attempts. Please wait a moment before trying
                    again.
                  </p>
                  <p className="text-xs mt-1">
                    The system will automatically unlock shortly.
                  </p>
                </div>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      id="remember-me"
                      type="checkbox"
                      name="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute block w-6 h-6 bg-gray-800 border-2 border-gray-700 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-primary-500 focus:outline-none duration-200 ease-in transition-all"
                    />
                    <label
                      htmlFor="remember-me"
                      className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                        rememberMe ? "bg-primary-600" : "bg-gray-700"
                      }`}
                    ></label>
                  </div>
                  <label
                    htmlFor="remember-me"
                    className="text-sm text-gray-400 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                  <motion.div
                    className={`ml-2 text-xs text-primary-400 ${
                      rememberMe ? "opacity-100" : "opacity-0"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: rememberMe ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="bg-primary-900/50 px-1.5 py-0.5 rounded-sm border border-primary-800/50">
                      30 days
                    </span>
                  </motion.div>
                </div>

                <div className="text-sm">
                  <motion.a
                    href="#"
                    className="font-medium text-primary-400 hover:text-primary-300 relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Forgot your password?
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </motion.a>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DarkButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={authLocked}
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                  glow
                  className={`py-2.5 text-base font-medium tracking-wide relative overflow-hidden group ${
                    authLocked ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <motion.span
                    className="relative z-10 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </DarkButton>
              </motion.div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <a
                    href="#"
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-md bg-gray-800/80 text-sm font-medium text-gray-300 hover:bg-gray-700/90 hover:border-gray-600 transition-all duration-200"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </a>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <a
                    href="#"
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-md bg-gray-800/80 text-sm font-medium text-gray-300 hover:bg-gray-700/90 hover:border-gray-600 transition-all duration-200"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0014.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
                    </svg>
                    Facebook
                  </a>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <motion.p
                className="text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Don't have an account?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    to="/register"
                    className="font-medium text-primary-400 hover:text-primary-300 relative group"
                  >
                    Sign up
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </motion.span>
              </motion.p>
            </div>
          </DarkCardBody>
        </DarkCard>
      </div>
    </div>
  );
};

export default LoginDark;
