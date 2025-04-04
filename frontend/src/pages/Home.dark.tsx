import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRightIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import {
  AnimatedText,
  MathBackground,
  ScrollReveal,
  FadeIn,
  Stagger,
  NumberCounter,
  EquationSolver,
} from "../components/animations";
import { DigitDisplay } from "../components/game";
import {
  DarkButton,
  DarkCard,
  DarkCardBody,
  DarkCardHeader,
} from "../components/ui";

const HomeDark = () => {
  // Refs for scroll animations
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Hero Section with Math Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 text-white py-24 md:py-32">
        {/* Animated background */}
        <MathBackground count={30} className="text-gray-800" speed={0.2} />

        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary-900 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-900 rounded-full opacity-10 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
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
              <span className="bg-primary-900/50 backdrop-blur-sm text-primary-400 text-sm font-medium px-3 py-1 rounded-full border border-primary-700/50">
                Challenge Your Math Skills
              </span>
            </motion.div>

            <AnimatedText
              text="Welcome to HectoClash"
              type="chars"
              animationType="wave"
              className="text-5xl md:text-7xl font-display font-bold mb-6"
              tag="h1"
            />

            <motion.p
              className="text-xl md:text-2xl mb-10 text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              The ultimate real-time competitive mental math game based on the
              Hectoc format.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link to="/play">
                <DarkButton
                  variant="primary"
                  size="lg"
                  icon={<ArrowRightIcon className="ml-2 h-5 w-5" />}
                  iconPosition="right"
                  glow
                >
                  Play Now
                </DarkButton>
              </Link>
              <Link to="/learn">
                <DarkButton variant="ghost" size="lg">
                  Learn How to Play
                </DarkButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating cards */}
          <div className="mt-16 relative h-64 md:h-80 hidden md:block">
            <motion.div
              className="absolute left-[10%] top-0 w-64 bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-800"
              initial={{ opacity: 0, y: 100, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: -5 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="bg-primary-900/80 p-3 text-white font-medium border-l-4 border-primary-500">
                Hectoc Challenge
              </div>
              <div className="p-4">
                <div className="flex justify-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5, 6].map((digit) => (
                    <div
                      key={digit}
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-lg font-bold text-primary-400 border border-gray-700"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-400">
                  Make these digits equal 100
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute right-[15%] top-10 w-72 bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-800"
              initial={{ opacity: 0, y: 100, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 5 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="bg-accent-900/80 p-3 text-white font-medium flex justify-between items-center border-l-4 border-accent-500">
                <span>Live Match</span>
                <span className="animate-pulse flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                  Live
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 font-bold mx-auto border border-primary-700/50">
                      M
                    </div>
                    <div className="mt-1 font-medium text-white">MathWiz</div>
                    <div className="text-xs text-gray-400">1850</div>
                  </div>

                  <div className="text-xl font-bold text-gray-500">vs</div>

                  <div className="text-center">
                    <div className="h-10 w-10 rounded-full bg-accent-900/50 flex items-center justify-center text-accent-400 font-bold mx-auto border border-accent-700/50">
                      N
                    </div>
                    <div className="mt-1 font-medium text-white">
                      NumberNinja
                    </div>
                    <div className="text-xs text-gray-400">1920</div>
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
              fill="#111827"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900" ref={targetRef}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="bg-primary-900/50 text-primary-400 text-sm font-medium px-3 py-1 rounded-full border border-primary-700/50">
                Game Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-white">
                Why Players Love HectoClash
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                HectoClash combines mental math challenges with competitive
                gameplay for an engaging and educational experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Real-Time Duels",
                description:
                  "Challenge other players to live, timed Hectoc battles and test your mental math skills against opponents from around the world.",
                icon: <ClockIcon className="h-8 w-8 text-primary-400" />,
                variant: "primary",
              },
              {
                title: "Dynamic Puzzles",
                description:
                  "Each game features randomly generated six-digit sequences for varied and unpredictable challenges that keep the gameplay fresh.",
                icon: (
                  <PuzzlePieceIcon className="h-8 w-8 text-secondary-400" />
                ),
                variant: "secondary",
              },
              {
                title: "Leaderboards",
                description:
                  "Compete for the top spot on our global leaderboards and track your progress over time as you improve your skills.",
                icon: <TrophyIcon className="h-8 w-8 text-accent-400" />,
                variant: "accent",
              },
            ].map((feature, index) => (
              <ScrollReveal
                key={feature.title}
                delay={0.2 * index}
                direction="up"
              >
                <DarkCard
                  hover
                  className="h-full"
                  variant={
                    feature.variant as "primary" | "secondary" | "accent"
                  }
                >
                  <DarkCardBody>
                    <div
                      className={`bg-${feature.variant}-900/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6 border border-${feature.variant}-700/50`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </DarkCardBody>
                </DarkCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="bg-accent-900/50 text-accent-400 text-sm font-medium px-3 py-1 rounded-full border border-accent-700/50">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-white">
                Master the Hectoc Challenge
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Hectoc is a mental calculation game where you insert operations
                between digits to make the expression equal to 100.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <DarkCard>
              <DarkCardBody>
                <ScrollReveal>
                  <h3 className="text-2xl font-bold mb-8 text-center text-white bg-gray-800/50 py-3 px-6 rounded-lg inline-block mx-auto border-b-2 border-primary-500">
                    Example: Given the sequence "123456"
                  </h3>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 hidden md:block"></div>
                  <ScrollReveal direction="left">
                    <div className="bg-gray-900/50 p-6 rounded-lg border border-primary-700/30 h-full">
                      <h4 className="text-xl font-semibold mb-4 text-primary-400 flex items-center">
                        <span className="bg-primary-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm border border-primary-700/50">
                          1
                        </span>
                        The Challenge:
                      </h4>
                      <div className="mb-6">
                        <DigitDisplay
                          digits={[1, 2, 3, 4, 5, 6]}
                          size="md"
                          variant="primary"
                          interactive={true}
                          staggered={true}
                          staggerDelay={0.1}
                          className="mb-2"
                        />
                      </div>
                      <p className="text-gray-400 text-center">
                        Insert mathematical operations (addition, subtraction,
                        multiplication, division, exponentiation, and
                        parentheses) to make the expression equal to 100.
                      </p>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="right" delay={0.3}>
                    <div className="bg-gray-900/50 p-6 rounded-lg border border-accent-700/30 h-full">
                      <h4 className="text-xl font-semibold mb-4 text-accent-400 flex items-center">
                        <span className="bg-accent-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm border border-accent-700/50">
                          2
                        </span>
                        A Solution:
                      </h4>
                      <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-700 shadow-lg">
                        <EquationSolver
                          equation="1+(2+3+4)×(5+6)"
                          steps={["1+(9)×(11)", "1+99"]}
                          result="= 100"
                          className="text-white text-xl"
                          stepDuration={1.5}
                          highlightColor="text-accent-400"
                          autoPlay={true}
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </DarkCardBody>
            </DarkCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 to-primary-950 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                value: "10,000+",
                label: "Active Players",
                icon: <UserGroupIcon className="h-6 w-6" />,
              },
              {
                value: "1M+",
                label: "Puzzles Solved",
                icon: <PuzzlePieceIcon className="h-6 w-6" />,
              },
              {
                value: "120+",
                label: "Countries",
                icon: <SparklesIcon className="h-6 w-6" />,
              },
              {
                value: "1,450",
                label: "Avg. Rating",
                icon: <ChartBarIcon className="h-6 w-6" />,
              },
            ].map((stat, index) => (
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
                  <span className="inline-block bg-white/10 p-3 rounded-full border border-white/20">
                    {stat.icon}
                  </span>
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold mb-1 text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-950 text-white">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Challenge Your Math Skills?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-300">
              Join thousands of players and put your mental math abilities to
              the test in real-time competitive matches.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/register">
                <DarkButton
                  variant="primary"
                  size="lg"
                  icon={<UserGroupIcon className="ml-2 h-5 w-5" />}
                  iconPosition="right"
                  glow
                >
                  Create Account
                </DarkButton>
              </Link>
              <Link to="/play">
                <DarkButton variant="ghost" size="lg">
                  Play as Guest
                </DarkButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default HomeDark;
