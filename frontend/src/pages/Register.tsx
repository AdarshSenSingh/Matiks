import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  LockClosedIcon, 
  EnvelopeIcon, 
  UserIcon, 
  ExclamationCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { FadeIn, ScaleIn } from '../components/animations';
import { Button, Card, CardBody, Input } from '../components/ui';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // Clear any auth errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Update local error state if auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Check password strength
  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    
    setPasswordChecks(checks);
    
    // Calculate strength (0-4)
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Please create a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      // Call the register function from AuthContext
      await register(username, email, password);
      
      // Redirect to home page after successful registration
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Background animation elements
  const backgroundElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  // Get strength color
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {backgroundElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full bg-secondary-500 opacity-5"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: el.delay,
            }}
          />
        ))}
      </div>

      <FadeIn className="w-full max-w-md">
        <Card>
          <CardBody className="p-8">
            <ScaleIn>
              <div className="text-center">
                <Link to="/" className="inline-block group mb-2">
                  <h3 className="text-2xl font-display font-bold">
                    <motion.span 
                      className="text-accent-500 inline-block"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Hecto
                    </motion.span>
                    <motion.span 
                      className="text-primary-600 inline-block"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    >
                      Clash
                    </motion.span>
                  </h3>
                </Link>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                  Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Or{' '}
                  <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                    sign in to your existing account
                  </Link>
                </p>
              </div>
            </ScaleIn>
            
            {error && (
              <motion.div 
                className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="Username"
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  icon={<UserIcon className="h-5 w-5" />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                
                <Input
                  label="Email address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  icon={<EnvelopeIcon className="h-5 w-5" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <div>
                  <Input
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    icon={<LockClosedIcon className="h-5 w-5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex space-x-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level}
                            className={`h-1 flex-1 rounded-full ${passwordStrength >= level ? getStrengthColor() : 'bg-gray-200'}`}
                          ></div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center">
                            <CheckCircleIcon className={`h-3 w-3 mr-1 ${passwordChecks.length ? 'text-green-500' : 'text-gray-300'}`} />
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className={`h-3 w-3 mr-1 ${passwordChecks.uppercase ? 'text-green-500' : 'text-gray-300'}`} />
                            <span>Uppercase letter</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className={`h-3 w-3 mr-1 ${passwordChecks.lowercase ? 'text-green-500' : 'text-gray-300'}`} />
                            <span>Lowercase letter</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className={`h-3 w-3 mr-1 ${passwordChecks.number ? 'text-green-500' : 'text-gray-300'}`} />
                            <span>Number</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  icon={<LockClosedIcon className="h-5 w-5" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPassword && password !== confirmPassword ? "Passwords don't match" : ""}
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-4">
                  By registering, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or register with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                >
                  <span className="sr-only">Sign up with Google</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </motion.a>

                <motion.a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                >
                  <span className="sr-only">Sign up with GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </motion.a>
              </div>
            </div>
          </CardBody>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Register;
