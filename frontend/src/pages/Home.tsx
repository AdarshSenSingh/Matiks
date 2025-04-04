import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowRightIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { ScrollReveal, FadeIn, Stagger } from "../components/animations";
import { Button, Card, CardBody } from "../components/ui";

const Home = () => {
  // Get authentication state
  const { isAuthenticated } = useAuth();

  // Refs for scroll animations
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // Transform values based on scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Features data
  const features = [
    {
      title: "Real-Time Duels",
      description:
        "Challenge other players to live, timed Hectoc battles and test your mental math skills against opponents from around the world.",
      icon: <ClockIcon className="h-8 w-8 text-primary-600" />,
      color: "bg-primary-100",
    },
    {
      title: "Dynamic Puzzles",
      description:
        "Each game features randomly generated six-digit sequences for varied and unpredictable challenges that keep the gameplay fresh.",
      icon: <PuzzlePieceIcon className="h-8 w-8 text-primary-600" />,
      color: "bg-primary-100",
    },
    {
      title: "Leaderboards",
      description:
        "Compete for the top spot on our global leaderboards and track your progress over time as you improve your skills.",
      icon: <TrophyIcon className="h-8 w-8 text-primary-600" />,
      color: "bg-primary-100",
    },
  ];

  // Stats data
  const stats = [
    { label: "Active Players", value: "10,000+" },
    { label: "Puzzles Solved", value: "1M+" },
    { label: "Countries", value: "120+" },
    { label: "Avg. Rating", value: "1,450" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-900 text-white py-24 md:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-primary-600 opacity-20 blur-3xl"
            animate={{
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{ y, opacity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-500 opacity-20 blur-3xl"
            animate={{
              y: [0, -40, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-secondary-500 opacity-10 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              className="inline-block mb-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              <span className="bg-white/10 backdrop-blur-sm text-accent-300 text-sm font-medium px-3 py-1 rounded-full">
                Challenge Your Math Skills
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-display font-bold mb-6"
              variants={itemVariants}
            >
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-500 inline-block">
                Hecto
              </span>
              Clash
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-10 text-gray-200"
              variants={itemVariants}
            >
              The ultimate real-time competitive mental math game based on the
              Hectoc format.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              variants={itemVariants}
            >
              <Link to="/play">
                <Button
                  variant="accent"
                  size="lg"
                  icon={<ArrowRightIcon className="ml-2 h-5 w-5" />}
                  iconPosition="right"
                  className="shadow-lg shadow-accent-500/20"
                >
                  Play Now
                </Button>
              </Link>
              <Link to="/learn">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Learn How to Play
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating cards */}
          <div className="mt-16 relative h-64 md:h-80 hidden md:block">
            <motion.div
              className="absolute left-[10%] top-0 w-64 bg-white rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 100, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: -5 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="bg-primary-600 p-3 text-white font-medium">
                Hectoc Challenge
              </div>
              <div className="p-4">
                <div className="flex justify-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5, 6].map((digit) => (
                    <div
                      key={digit}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-lg font-bold text-primary-800"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600">
                  Make these digits equal 100
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute right-[15%] top-10 w-72 bg-white rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 100, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 5 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="bg-accent-500 p-3 text-white font-medium flex justify-between items-center">
                <span>Live Match</span>
                <span className="animate-pulse flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                  Live
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mx-auto">
                      M
                    </div>
                    <div className="mt-1 font-medium">MathWiz</div>
                    <div className="text-xs text-gray-500">1850</div>
                  </div>

                  <div className="text-xl font-bold text-gray-400">vs</div>

                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold mx-auto">
                      N
                    </div>
                    <div className="mt-1 font-medium">NumberNinja</div>
                    <div className="text-xs text-gray-500">1920</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#f9fafb"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50" ref={targetRef}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                Game Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
                Why Players Love HectoClash
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                HectoClash combines mental math challenges with competitive
                gameplay for an engaging and educational experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <ScrollReveal
                key={feature.title}
                delay={0.2 * index}
                direction="up"
              >
                <Card hover className="h-full">
                  <CardBody>
                    <div
                      className={`${feature.color} p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="bg-accent-100 text-accent-800 text-sm font-medium px-3 py-1 rounded-full">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
                Master the Hectoc Challenge
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hectoc is a mental calculation game where you insert operations
                between digits to make the expression equal to 100.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardBody>
                <ScrollReveal>
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    Example: Given the sequence "123456"
                  </h3>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ScrollReveal direction="left">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-primary-700">
                        The Challenge:
                      </h4>
                      <div className="flex justify-center space-x-2 mb-6">
                        <Stagger>
                          {[1, 2, 3, 4, 5, 6].map((digit) => (
                            <div
                              key={digit}
                              className="w-12 h-12 flex items-center justify-center bg-primary-100 rounded-lg text-2xl font-bold text-primary-800"
                            >
                              {digit}
                            </div>
                          ))}
                        </Stagger>
                      </div>
                      <p className="text-gray-600">
                        Insert mathematical operations (addition, subtraction,
                        multiplication, division, exponentiation, and
                        parentheses) to make the expression equal to 100.
                      </p>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="right" delay={0.3}>
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-accent-600">
                        A Solution:
                      </h4>
                      <div className="bg-accent-50 p-6 rounded-lg border border-accent-200">
                        <motion.p
                          className="text-2xl font-mono text-center mb-4"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          viewport={{ once: true }}
                        >
                          1 + (2 + 3 + 4) × (5 + 6)
                        </motion.p>
                        <motion.div
                          className="space-y-1 text-center text-accent-700"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          viewport={{ once: true }}
                        >
                          <p>= 1 + 9 × 11</p>
                          <p>= 1 + 99</p>
                          <p>= 100</p>
                        </motion.div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <ScrollReveal
                key={stat.label}
                direction="up"
                delay={0.1 * index}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1 * index,
                  }}
                  viewport={{ once: true }}
                  className="mb-2"
                >
                  <span className="inline-block bg-white/10 p-3 rounded-full">
                    {index === 0 && <UserGroupIcon className="h-6 w-6" />}
                    {index === 1 && <PuzzlePieceIcon className="h-6 w-6" />}
                    {index === 2 && <SparklesIcon className="h-6 w-6" />}
                    {index === 3 && <ChartBarIcon className="h-6 w-6" />}
                  </span>
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-700 to-secondary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Challenge Your Math Skills?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of players and put your mental math abilities to
              the test in real-time competitive matches.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button
                      variant="accent"
                      size="lg"
                      icon={<UserGroupIcon className="ml-2 h-5 w-5" />}
                      iconPosition="right"
                      className="shadow-lg shadow-accent-500/20"
                    >
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/play">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white text-secondary-800 hover:bg-gray-100"
                    >
                      Play as Guest
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/play">
                  <Button
                    variant="accent"
                    size="lg"
                    icon={<BoltIcon className="ml-2 h-5 w-5" />}
                    iconPosition="right"
                    className="shadow-lg shadow-accent-500/20"
                  >
                    Play Now
                  </Button>
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
