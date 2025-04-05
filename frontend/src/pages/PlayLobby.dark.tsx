import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../components/WebSocketProvider";
import { useAuth } from "../hooks/useAuth";
import {
  UserGroupIcon,
  UserIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowRightIcon,
  BoltIcon,
  SparklesIcon,
  CalculatorIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  DarkButton,
  DarkCard,
  DarkCardHeader,
  DarkCardBody,
} from "../components/ui";
import {
  AnimatedText,
  MathBackground,
  NumberCounter,
  FloatingElement,
  TiltCard,
  ParticleBackground,
} from "../components/animations";
import DuelMatchmaking from "../components/game/DuelMatchmaking.dark";

const PlayLobbyDark = () => {
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [isRanked, setIsRanked] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { sendMessage } = useWebSocket();
  const { isAuthenticated } = useAuth();

  // Listen for WebSocket events
  useEffect(() => {
    // Handle game created event
    const handleGameCreated = (event: any) => {
      const data = event.detail;
      console.log("Game created event received:", data);

      // Hide matchmaking UI
      setShowMatchmaking(false);

      // Navigate to the duel game page
      const newGameId = data.game_id;
      navigate(`/game/duel/${isRanked ? "ranked" : "unranked"}/${newGameId}`);
    };

    // Handle error event
    const handleError = (event: any) => {
      const data = event.detail;
      console.log("Error event received:", data);

      // Set error message
      if (data && data.message) {
        setError(data.message);
      } else {
        setError("An unknown error occurred");
      }

      // Hide matchmaking UI after a short delay
      setTimeout(() => {
        setShowMatchmaking(false);
      }, 3000);
    };

    // Add event listeners
    window.addEventListener("game_created", handleGameCreated);
    window.addEventListener("error_message", handleError);

    // Clean up event listeners
    return () => {
      window.removeEventListener("game_created", handleGameCreated);
      window.removeEventListener("error_message", handleError);
    };
  }, [navigate, isRanked]);

  const handleStartDuel = (ranked: boolean) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsRanked(ranked);
    setShowMatchmaking(true);

    // Send join queue message via WebSocket
    const joinQueueMessage = {
      type: "join_queue",
      timestamp: Date.now(),
      payload: {
        game_type: "duel",
        ranked: ranked,
      },
    };

    console.log("Sending WebSocket message:", joinQueueMessage);
    sendMessage(joinQueueMessage);
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);

    // Send leave queue message via WebSocket
    const leaveQueueMessage = {
      type: "leave_queue",
      timestamp: Date.now(),
      payload: {},
    };

    console.log("Sending leave queue message:", leaveQueueMessage);
    sendMessage(leaveQueueMessage);
  };

  const handlePracticeMode = () => {
    navigate("/game/practice");
  };

  const handleDailyChallenge = () => {
    navigate("/game/daily");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Game mode cards data
  const gameModes = [
    {
      title: "Duel Mode",
      description:
        "Challenge other players in real-time duels. Choose between ranked matches to climb the leaderboard or unranked for casual play!",
      icon: <UserGroupIcon className="h-6 w-6 text-primary-400" />,
      features: [
        {
          text: "60-second time limit",
          icon: <ClockIcon className="h-4 w-4 mr-2 text-primary-400" />,
        },
        {
          text: "Matched with similar skill",
          icon: <UserGroupIcon className="h-4 w-4 mr-2 text-primary-400" />,
        },
        {
          text: "Toggle between ranked and unranked",
          icon: <TrophyIcon className="h-4 w-4 mr-2 text-primary-400" />,
        },
      ],
      badge: {
        text: "Real-time Competition",
        icon: <BoltIcon className="h-3 w-3 mr-1" />,
      },
      buttonText: "Start Duel",
      buttonIcon: <ArrowRightIcon className="h-5 w-5" />,
      onClick: () => handleStartDuel(true),
      variant: "primary",
    },

    {
      title: "Practice Mode",
      description:
        "Practice solving Hectoc puzzles at your own pace. Perfect for improving your skills.",
      icon: <CalculatorIcon className="h-6 w-6 text-secondary-400" />,
      features: [
        {
          text: "No time pressure",
          icon: <ClockIcon className="h-4 w-4 mr-2 text-secondary-400" />,
        },
        {
          text: "Play solo at your own pace",
          icon: <UserIcon className="h-4 w-4 mr-2 text-secondary-400" />,
        },
        {
          text: "Learn strategies and techniques",
          icon: <AcademicCapIcon className="h-4 w-4 mr-2 text-secondary-400" />,
        },
      ],
      badge: {
        text: "Self-paced",
        icon: <ClockIcon className="h-3 w-3 mr-1" />,
      },
      buttonText: "Start Practice",
      buttonIcon: <ArrowRightIcon className="h-5 w-5" />,
      onClick: handlePracticeMode,
      variant: "secondary",
    },
    {
      title: "Daily Challenge",
      description:
        "A new challenging puzzle every day. Compare your solution time with other players.",
      icon: <PuzzlePieceIcon className="h-6 w-6 text-accent-400" />,
      features: [
        {
          text: "New puzzle every 24 hours",
          icon: <ClockIcon className="h-4 w-4 mr-2 text-accent-400" />,
        },
        {
          text: "Global leaderboard for each puzzle",
          icon: <ChartBarIcon className="h-4 w-4 mr-2 text-accent-400" />,
        },
        {
          text: "Earn badges for streaks",
          icon: <TrophyIcon className="h-4 w-4 mr-2 text-accent-400" />,
        },
      ],
      badge: {
        text: "Daily Puzzle",
        icon: <SparklesIcon className="h-3 w-3 mr-1" />,
      },
      buttonText: "Today's Challenge",
      buttonIcon: <ArrowRightIcon className="h-5 w-5" />,
      onClick: handleDailyChallenge,
      variant: "accent",
    },
  ];

  // Player stats data
  const playerStats = [
    { label: "Games Played", value: 42, color: "text-primary-400" },
    { label: "Games Won", value: 28, color: "text-green-400" },
    { label: "Win Rate", value: 66.7, color: "text-accent-400", suffix: "%" },
    { label: "Rating", value: 1800, color: "text-secondary-400" },
  ];

  // Animation controls for interactive elements
  const controls = useAnimation();

  // Trigger animations on page load
  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    });
  }, [controls]);

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated backgrounds */}
      <div className="absolute inset-0 z-0">
        <MathBackground count={40} className="text-gray-800" speed={0.2} />
        <ParticleBackground
          count={30}
          colors={["#4f46e5", "#7c3aed", "#2563eb", "#0ea5e9", "#0891b2"]}
          className="opacity-30"
          speed={0.3}
        />
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 right-[10%] w-64 h-64 bg-primary-900 rounded-full opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-900 rounded-full opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.12, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute top-[40%] left-[20%] w-40 h-40 bg-secondary-900 rounded-full opacity-10 blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <FloatingElement yOffset={5} duration={4}>
            <AnimatedText
              text="Choose Your Game Mode"
              type="chars"
              animationType="wave"
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-white to-accent-400 mb-4"
              tag="h1"
              staggerChildren={0.05}
            />
          </FloatingElement>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Challenge yourself or compete against other players in different
            Hectoc game modes. Solve puzzles, climb the ranks, and become a math
            master!
          </motion.p>

          <motion.div
            className="flex justify-center mt-6 space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-900/50 text-primary-300 border border-primary-700/30">
              <FireIcon className="h-3 w-3 mr-1" />
              Real-time Duels
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-900/50 text-secondary-300 border border-secondary-700/30">
              <StarIcon className="h-3 w-3 mr-1" />
              Daily Challenges
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-900/50 text-accent-300 border border-accent-700/30">
              <LightBulbIcon className="h-3 w-3 mr-1" />
              Practice Mode
            </span>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {gameModes.map((mode) => (
            <motion.div key={mode.title} variants={itemVariants}>
              <TiltCard
                tiltFactor={10}
                perspective={1500}
                glareEnabled={true}
                glareMaxOpacity={0.15}
              >
                <DarkCard
                  className="h-full transform transition-all duration-500"
                  variant={mode.variant as "primary" | "secondary" | "accent"}
                  hover
                  glow
                >
                  <DarkCardHeader
                    variant={mode.variant as "primary" | "secondary" | "accent"}
                    withAccent
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">
                        {mode.title}
                      </h2>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {mode.icon}
                      </motion.div>
                    </div>
                  </DarkCardHeader>
                  <DarkCardBody className="flex flex-col h-full">
                    <div className="flex-1">
                      <motion.div
                        className={`bg-${mode.variant}-900/50 text-${mode.variant}-400 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mb-4 border border-${mode.variant}-500/30`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <motion.span
                          className="mr-1"
                          animate={{ rotate: [0, 10, 0, -10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                        >
                          {mode.badge.icon}
                        </motion.span>
                        {mode.badge.text}
                      </motion.div>

                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {mode.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        {mode.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center text-sm text-gray-400 p-1.5 rounded-lg hover:bg-gray-800/30 transition-colors"
                            whileHover={{ x: 3 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            }}
                          >
                            <motion.span
                              className="mr-2 text-gray-300"
                              whileHover={{ rotate: 15 }}
                            >
                              {feature.icon}
                            </motion.span>
                            <span>{feature.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <DarkButton
                      variant={
                        mode.variant as "primary" | "secondary" | "accent"
                      }
                      fullWidth
                      onClick={mode.onClick}
                      icon={mode.buttonIcon}
                      iconPosition="right"
                      glow
                    >
                      {mode.buttonText}
                    </DarkButton>
                  </DarkCardBody>
                </DarkCard>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <DarkCard
            variant="neutral"
            border
            glow
            className="backdrop-blur-md bg-gray-900/80"
          >
            <DarkCardHeader
              variant="neutral"
              className="border-b border-gray-800/50"
            >
              <h2 className="text-xl font-bold text-center text-white flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="mr-2"
                >
                  <SparklesIcon className="h-5 w-5 text-primary-400" />
                </motion.div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
                  Your Stats
                </span>
              </h2>
            </DarkCardHeader>
            <DarkCardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {playerStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-300 group"
                    whileHover={{ y: -5 }}
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="mb-2 relative"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg opacity-0 group-hover:opacity-30 blur transition duration-500 group-hover:duration-200" />
                      <div
                        className={`text-3xl font-bold ${stat.color} relative`}
                      >
                        <NumberCounter
                          value={stat.value}
                          formatFn={(val) => `${val}${stat.suffix || ""}`}
                          duration={1.5}
                        />
                      </div>
                    </motion.div>
                    <div className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <div className="flex flex-wrap justify-between text-sm text-gray-400">
                  <motion.div
                    className="flex items-center"
                    whileHover={{ x: 3, color: "#f3f4f6" }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <ClockIcon className="h-4 w-4 mr-1 text-primary-400" />
                    Last played: 2 hours ago
                  </motion.div>
                  <motion.div
                    className="flex items-center"
                    whileHover={{ x: -3, color: "#f3f4f6" }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <TrophyIcon className="h-4 w-4 mr-1 text-accent-400" />
                    Current rank: #42 of 10,000+ players
                  </motion.div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800/30">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Daily challenge streak:
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((day) => (
                          <motion.div
                            key={day}
                            className={`h-3 w-3 rounded-full mx-0.5 ${
                              day <= 3 ? "bg-primary-500" : "bg-gray-700"
                            }`}
                            whileHover={{ scale: 1.2 }}
                            animate={day <= 3 ? { scale: [1, 1.1, 1] } : {}}
                            transition={
                              day <= 3
                                ? {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                  }
                                : {}
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-primary-400 ml-2">
                        3 days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DarkCardBody>
          </DarkCard>
        </motion.div>
      </div>

      {/* Matchmaking modal */}
      <DuelMatchmaking
        isOpen={showMatchmaking}
        onCancel={handleCancelMatchmaking}
        isRanked={isRanked}
        error={error}
      />
    </div>
  );
};

export default PlayLobbyDark;
