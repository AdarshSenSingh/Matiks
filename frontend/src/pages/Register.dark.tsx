import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { DarkButton, DarkCard, DarkCardBody } from "../components/ui";
import { MathBackground, AnimatedText } from "../components/animations";
import { useAuth } from "../hooks/useAuth";

const RegisterDark = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const {
    register,
    loading: isLoading,
    error: authError,
    clearError,
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

  // Password strength indicators
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-red-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      strength,
      label: labels[strength - 1] || "Weak",
      color: colors[strength - 1] || "bg-red-500",
    };
  };

  const passwordStrength = getPasswordStrength(password);

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

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength.strength < 2) {
      setError("Please use a stronger password");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    try {
      await register(username, email, password);
      // If registration is successful, navigate to the redirect path
      navigate(from, { replace: true });
    } catch (error: any) {
      // Error is handled by the auth context and set to authError
      console.error("Registration error:", error);
    }
  };

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
          text="Create Your Account"
          type="words"
          animationType="fade"
          className="mt-6 text-center text-3xl font-bold text-white"
          tag="h2"
        />
        <p className="mt-2 text-center text-sm text-gray-400">
          Join the community and start your math journey
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="MathWizard"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">
                        Password strength:
                      </span>
                      <span
                        className={`text-xs ${
                          passwordStrength.strength >= 3
                            ? "text-green-400"
                            : passwordStrength.strength >= 2
                            ? "text-blue-400"
                            : passwordStrength.strength >= 1
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(passwordStrength.strength / 4) * 100}%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${
                            password.length >= 8
                              ? "bg-green-500"
                              : "bg-gray-600"
                          }`}
                        />
                        <span className="text-gray-400">8+ characters</span>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${
                            /[A-Z]/.test(password)
                              ? "bg-green-500"
                              : "bg-gray-600"
                          }`}
                        />
                        <span className="text-gray-400">Uppercase letter</span>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${
                            /[0-9]/.test(password)
                              ? "bg-green-500"
                              : "bg-gray-600"
                          }`}
                        />
                        <span className="text-gray-400">Number</span>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${
                            /[^A-Za-z0-9]/.test(password)
                              ? "bg-green-500"
                              : "bg-gray-600"
                          }`}
                        />
                        <span className="text-gray-400">Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  {password && confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {password === confirmPassword ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-400"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <DarkButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                  glow
                >
                  Create Account
                </DarkButton>
              </div>
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
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
                  >
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
                  >
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-400 hover:text-primary-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </DarkCardBody>
        </DarkCard>
      </div>
    </div>
  );
};

export default RegisterDark;
