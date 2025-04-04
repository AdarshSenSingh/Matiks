import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrophyIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  DarkButton,
  DarkCard,
  DarkCardHeader,
  DarkCardBody,
} from "../components/ui";
import {
  MathBackground,
  NumberCounter,
  AnimatedText,
} from "../components/animations";

// Mock leaderboard data
const MOCK_LEADERBOARD_DATA = [
  {
    id: 1,
    rank: 1,
    username: "MathWizard",
    rating: 2150,
    winRate: 78,
    gamesPlayed: 342,
    streak: 12,
    change: 2,
  },
  {
    id: 2,
    rank: 2,
    username: "NumberNinja",
    rating: 2080,
    winRate: 75,
    gamesPlayed: 256,
    streak: 8,
    change: 0,
  },
  {
    id: 3,
    rank: 3,
    username: "CalculusKing",
    rating: 2045,
    winRate: 72,
    gamesPlayed: 310,
    streak: 5,
    change: 1,
  },
  {
    id: 4,
    rank: 4,
    username: "AlgebraMaster",
    rating: 1980,
    winRate: 70,
    gamesPlayed: 215,
    streak: 3,
    change: -2,
  },
  {
    id: 5,
    rank: 5,
    username: "PrimeTime",
    rating: 1950,
    winRate: 68,
    gamesPlayed: 189,
    streak: 0,
    change: 0,
  },
  {
    id: 6,
    rank: 6,
    username: "LogarithmLegend",
    rating: 1920,
    winRate: 67,
    gamesPlayed: 203,
    streak: 4,
    change: 3,
  },
  {
    id: 7,
    rank: 7,
    username: "FractionFanatic",
    rating: 1890,
    winRate: 65,
    gamesPlayed: 178,
    streak: 2,
    change: -1,
  },
  {
    id: 8,
    rank: 8,
    username: "DecimalDestroyer",
    rating: 1870,
    winRate: 64,
    gamesPlayed: 156,
    streak: 0,
    change: 0,
  },
  {
    id: 9,
    rank: 9,
    username: "GeometryGenius",
    rating: 1840,
    winRate: 62,
    gamesPlayed: 142,
    streak: 1,
    change: 2,
  },
  {
    id: 10,
    rank: 10,
    username: "TrigTitan",
    rating: 1820,
    winRate: 60,
    gamesPlayed: 135,
    streak: 0,
    change: -3,
  },
  // Current user
  {
    id: 42,
    rank: 42,
    username: "You",
    rating: 1650,
    winRate: 55,
    gamesPlayed: 85,
    streak: 3,
    change: 5,
    isCurrentUser: true,
  },
];

// Leaderboard filter options
type FilterOption = "global" | "friends" | "weekly" | "monthly";

const LeaderboardDark = () => {
  const { isAuthenticated, user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState(MOCK_LEADERBOARD_DATA);
  const [filter, setFilter] = useState<FilterOption>("global");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    (typeof MOCK_LEADERBOARD_DATA)[0] | null
  >(null);

  // Filter options based on authentication status
  const availableFilters = useMemo(() => {
    const filters: FilterOption[] = ["global", "weekly", "monthly"];
    if (isAuthenticated) {
      filters.push("friends");
    }
    return filters;
  }, [isAuthenticated]);

  // Simulate loading data when filter changes
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    const timer = setTimeout(() => {
      // Shuffle the data a bit to simulate different results
      const shuffled = [...MOCK_LEADERBOARD_DATA]
        .sort(() => Math.random() - 0.5)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
          rating: user.rating + Math.floor(Math.random() * 50) - 25,
        }));

      // Only include the current user if authenticated
      let processedData = shuffled;
      if (isAuthenticated) {
        // Make sure the current user is always included
        const currentUser = shuffled.find((user) => user.isCurrentUser);
        if (currentUser) {
          currentUser.rank = Math.floor(Math.random() * 20) + 30; // Random rank between 30-50
        }
      } else {
        // Remove the current user if not authenticated
        processedData = shuffled.filter((user) => !user.isCurrentUser);
      }

      setLeaderboardData(processedData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [filter, isAuthenticated]);

  // Handle row click to show user details
  const handleRowClick = (user: (typeof MOCK_LEADERBOARD_DATA)[0]) => {
    setSelectedUser(user);
  };

  // Get medal icon based on rank
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  // Get rank change icon and color
  const getRankChangeDisplay = (change: number) => {
    if (change > 0) {
      return {
        icon: <ArrowUpIcon className="h-4 w-4 text-green-400" />,
        text: `+${change}`,
        color: "text-green-400",
      };
    }
    if (change < 0) {
      return {
        icon: <ArrowDownIcon className="h-4 w-4 text-red-400" />,
        text: change.toString(),
        color: "text-red-400",
      };
    }
    return {
      icon: null,
      text: "0",
      color: "text-gray-400",
    };
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated math background */}
      <MathBackground count={30} className="text-gray-800" speed={0.2} />

      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary-900 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-accent-900 rounded-full opacity-10 blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <DarkButton
              variant="ghost"
              size="sm"
              className="text-white"
              icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
            >
              Back to Home
            </DarkButton>
          </Link>

          <div className="flex space-x-3">
            {availableFilters.map((option, index) => {
              const isActive = filter === option;
              const getIcon = () => {
                switch (option) {
                  case "global":
                    return <TrophyIcon className="h-4 w-4 mr-1" />;
                  case "friends":
                    return <UserGroupIcon className="h-4 w-4 mr-1" />;
                  case "weekly":
                    return <ClockIcon className="h-4 w-4 mr-1" />;
                  case "monthly":
                    return <ChartBarIcon className="h-4 w-4 mr-1" />;
                  default:
                    return null;
                }
              };

              return (
                <motion.div
                  key={option}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DarkButton
                    variant={isActive ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(option)}
                    glow={isActive}
                    className={isActive ? "border-b-2 border-primary-400" : ""}
                    icon={getIcon()}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </DarkButton>
                  {isActive && (
                    <motion.div
                      className="h-0.5 bg-primary-500 mt-1 rounded-full"
                      layoutId="activeFilterIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-10">
          <AnimatedText
            text="Leaderboard"
            type="chars"
            animationType="wave"
            className="text-4xl font-bold text-white mb-4"
            tag="h1"
          />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See how you stack up against the best Hectoc players from around the
            world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Table */}
          <div className="lg:col-span-2">
            <DarkCard>
              <DarkCardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2 text-primary-400" />
                  Top Players
                </h2>
                <div className="text-sm text-gray-400">
                  {filter === "global"
                    ? "All Time Rankings"
                    : filter === "weekly"
                    ? "This Week's Rankings"
                    : filter === "monthly"
                    ? "This Month's Rankings"
                    : "Friends Rankings"}
                </div>
              </DarkCardHeader>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800/70 text-left border-b border-gray-700">
                      <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">
                        Win Rate
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    <AnimatePresence>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-gray-400"
                          >
                            <div className="flex justify-center">
                              <svg
                                className="animate-spin h-8 w-8 text-primary-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </div>
                            <div className="mt-2">
                              Loading leaderboard data...
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leaderboardData
                          .sort((a, b) => a.rank - b.rank)
                          .slice(0, 10)
                          .map((user) => {
                            const rankChange = getRankChangeDisplay(
                              user.change
                            );
                            return (
                              <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                  duration: 0.3,
                                  delay: user.rank * 0.05,
                                }}
                                whileHover={{
                                  scale: 1.01,
                                  backgroundColor: user.isCurrentUser
                                    ? "rgba(79, 70, 229, 0.4)"
                                    : "rgba(31, 41, 55, 0.5)",
                                }}
                                className={`${
                                  user.isCurrentUser
                                    ? "bg-primary-900/30 hover:bg-primary-900/40"
                                    : "hover:bg-gray-800/50"
                                } cursor-pointer transition-all duration-200 border-l-4 ${
                                  user.isCurrentUser
                                    ? "border-l-primary-500"
                                    : "border-l-transparent"
                                }`}
                                onClick={() => handleRowClick(user)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {user.rank <= 3 ? (
                                      <motion.div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                          user.rank === 1
                                            ? "bg-yellow-500/20 text-yellow-400"
                                            : user.rank === 2
                                            ? "bg-gray-400/20 text-gray-300"
                                            : "bg-amber-700/20 text-amber-600"
                                        } font-bold mr-2 border ${
                                          user.rank === 1
                                            ? "border-yellow-500/50"
                                            : user.rank === 2
                                            ? "border-gray-400/50"
                                            : "border-amber-700/50"
                                        }`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        animate={{
                                          scale: [1, 1.05, 1],
                                          rotate: [0, 2, 0],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          repeatType: "reverse",
                                        }}
                                      >
                                        {user.rank}
                                      </motion.div>
                                    ) : (
                                      <span className="text-lg font-semibold text-white mr-2 w-8 h-8 flex items-center justify-center">
                                        {user.rank}
                                      </span>
                                    )}
                                    {getMedalIcon(user.rank) && (
                                      <motion.span
                                        className="text-xl"
                                        animate={{
                                          scale: [1, 1.1, 1],
                                          rotate: [0, 5, 0],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          repeatType: "reverse",
                                        }}
                                      >
                                        {getMedalIcon(user.rank)}
                                      </motion.span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <motion.div
                                      className={`h-10 w-10 rounded-full ${
                                        user.isCurrentUser
                                          ? "bg-primary-900/70"
                                          : "bg-gray-800"
                                      } flex items-center justify-center ${
                                        user.isCurrentUser
                                          ? "text-primary-300"
                                          : "text-primary-400"
                                      } font-bold border ${
                                        user.isCurrentUser
                                          ? "border-primary-500/70"
                                          : "border-gray-700"
                                      } mr-3 shadow-lg`}
                                      whileHover={{ scale: 1.1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 10,
                                      }}
                                    >
                                      {user.username.charAt(0)}
                                    </motion.div>
                                    <div>
                                      <div className="font-medium text-white flex items-center">
                                        {user.username}
                                        {user.isCurrentUser && (
                                          <motion.span
                                            className="ml-2 text-xs bg-primary-900/50 text-primary-400 px-2 py-0.5 rounded-full border border-primary-700/50"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                          >
                                            You
                                          </motion.span>
                                        )}
                                      </div>
                                      {user.streak > 0 && (
                                        <div className="text-xs text-accent-400 flex items-center mt-1">
                                          <FireIcon className="h-3 w-3 mr-1" />
                                          <span>{user.streak} win streak</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <motion.div
                                    className="text-white font-semibold bg-gray-800/40 px-3 py-1 rounded-lg inline-block"
                                    whileHover={{
                                      scale: 1.05,
                                      backgroundColor: "rgba(79, 70, 229, 0.2)",
                                    }}
                                  >
                                    <NumberCounter
                                      value={user.rating}
                                      duration={1}
                                    />
                                  </motion.div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-white relative">
                                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto mb-1">
                                      <motion.div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${user.winRate}%` }}
                                        transition={{
                                          duration: 1,
                                          delay: user.rank * 0.05,
                                        }}
                                      />
                                    </div>
                                    <NumberCounter
                                      value={user.winRate}
                                      duration={1}
                                      formatFn={(val) => `${val}%`}
                                      className="font-medium"
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <motion.div
                                    className={`flex items-center justify-end ${rankChange.color} bg-gray-800/30 px-3 py-1 rounded-lg inline-flex ml-auto`}
                                    whileHover={{ scale: 1.05 }}
                                    animate={
                                      user.change !== 0 ? { y: [0, -2, 0] } : {}
                                    }
                                    transition={{
                                      repeat: user.change !== 0 ? Infinity : 0,
                                      repeatType: "reverse",
                                      duration: 1.5,
                                    }}
                                  >
                                    {rankChange.icon}
                                    <span className="ml-1 font-medium">
                                      {rankChange.text}
                                    </span>
                                  </motion.div>
                                </td>
                              </motion.tr>
                            );
                          })
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Current user's rank (if not in top 10) */}
              {!isLoading &&
                isAuthenticated &&
                !leaderboardData
                  .slice(0, 10)
                  .some((user) => user.isCurrentUser) && (
                  <div className="border-t border-gray-800 mt-2">
                    <table className="w-full">
                      <tbody>
                        {leaderboardData
                          .filter((user) => user.isCurrentUser)
                          .map((user) => {
                            const rankChange = getRankChangeDisplay(
                              user.change
                            );
                            return (
                              <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-primary-900/30 cursor-pointer"
                                onClick={() => handleRowClick(user)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-lg font-semibold text-white">
                                    {user.rank}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 font-bold border border-gray-700 mr-3">
                                      {user.username.charAt(0)}
                                    </div>
                                    <div className="font-medium text-white">
                                      {user.username}
                                      <span className="ml-2 text-xs bg-primary-900/50 text-primary-400 px-2 py-0.5 rounded-full border border-primary-700/50">
                                        You
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-white font-semibold">
                                    {user.rating}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-white">
                                    {user.winRate}%
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div
                                    className={`flex items-center justify-end ${rankChange.color}`}
                                  >
                                    {rankChange.icon}
                                    <span className="ml-1">
                                      {rankChange.text}
                                    </span>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
            </DarkCard>
          </div>

          {/* Player Details or Stats */}
          <div>
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div
                  key="player-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DarkCard>
                    <DarkCardHeader>
                      <h2 className="text-xl font-bold text-white">
                        Player Details
                      </h2>
                    </DarkCardHeader>
                    <DarkCardBody>
                      <div className="flex flex-col items-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 text-3xl font-bold border border-gray-700 mb-4">
                          {selectedUser.username.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {selectedUser.username}
                        </h3>
                        <div className="text-gray-400">
                          Rank #{selectedUser.rank}
                        </div>

                        {selectedUser.streak > 0 && (
                          <div className="mt-2 flex items-center bg-primary-900/50 text-primary-400 px-3 py-1 rounded-full border border-primary-700/50">
                            <FireIcon className="h-4 w-4 mr-1" />
                            <span>{selectedUser.streak} Win Streak</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
                          <div className="text-sm text-gray-400 mb-1">
                            Rating
                          </div>
                          <div className="text-2xl font-bold text-primary-400">
                            <NumberCounter
                              value={selectedUser.rating}
                              duration={1}
                            />
                          </div>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
                          <div className="text-sm text-gray-400 mb-1">
                            Win Rate
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            <NumberCounter
                              value={selectedUser.winRate}
                              duration={1}
                              formatFn={(val) => `${val}%`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-300">
                            <UserGroupIcon className="h-5 w-5 mr-2 text-primary-400" />
                            Games Played
                          </div>
                          <div className="text-white font-medium">
                            {selectedUser.gamesPlayed}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-300">
                            <TrophyIcon className="h-5 w-5 mr-2 text-primary-400" />
                            Games Won
                          </div>
                          <div className="text-white font-medium">
                            {Math.round(
                              selectedUser.gamesPlayed *
                                (selectedUser.winRate / 100)
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-300">
                            <ClockIcon className="h-5 w-5 mr-2 text-primary-400" />
                            Avg. Solve Time
                          </div>
                          <div className="text-white font-medium">42s</div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-300">
                            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-400" />
                            Rank Change
                          </div>
                          <div
                            className={`font-medium ${
                              selectedUser.change > 0
                                ? "text-green-400"
                                : selectedUser.change < 0
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          >
                            {selectedUser.change > 0
                              ? `+${selectedUser.change}`
                              : selectedUser.change}
                          </div>
                        </div>
                      </div>

                      {selectedUser.isCurrentUser && (
                        <div className="mt-6">
                          <Link to="/play">
                            <DarkButton variant="primary" fullWidth glow>
                              Play Now
                            </DarkButton>
                          </Link>
                        </div>
                      )}
                    </DarkCardBody>
                  </DarkCard>
                </motion.div>
              ) : (
                <motion.div
                  key="leaderboard-stats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DarkCard>
                    <DarkCardHeader>
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-primary-400" />
                        Leaderboard Stats
                      </h2>
                    </DarkCardHeader>
                    <DarkCardBody>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Top Players
                          </h3>
                          <div className="space-y-3">
                            {leaderboardData
                              .sort((a, b) => a.rank - b.rank)
                              .slice(0, 3)
                              .map((user, index) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/80 transition-colors"
                                  onClick={() => handleRowClick(user)}
                                >
                                  <div className="flex items-center">
                                    <div className="text-xl mr-2">
                                      {getMedalIcon(user.rank)}
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 font-bold border border-gray-700 mr-3">
                                      {user.username.charAt(0)}
                                    </div>
                                    <div className="font-medium text-white">
                                      {user.username}
                                    </div>
                                  </div>
                                  <div className="text-primary-400 font-semibold">
                                    {user.rating}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Highest Win Streaks
                          </h3>
                          <div className="space-y-3">
                            {leaderboardData
                              .sort((a, b) => b.streak - a.streak)
                              .slice(0, 3)
                              .map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/80 transition-colors"
                                  onClick={() => handleRowClick(user)}
                                >
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 font-bold border border-gray-700 mr-3">
                                      {user.username.charAt(0)}
                                    </div>
                                    <div className="font-medium text-white">
                                      {user.username}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-accent-400 font-semibold">
                                    <FireIcon className="h-4 w-4 mr-1" />
                                    {user.streak}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {isAuthenticated && (
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                              Your Position
                            </h3>
                            {leaderboardData
                              .filter((user) => user.isCurrentUser)
                              .map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between bg-primary-900/30 p-3 rounded-lg border border-primary-700/50 cursor-pointer hover:bg-primary-900/40 transition-colors"
                                  onClick={() => handleRowClick(user)}
                                >
                                  <div className="flex items-center">
                                    <div className="text-lg font-semibold text-white mr-3">
                                      #{user.rank}
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 font-bold border border-gray-700 mr-3">
                                      {user.username.charAt(0)}
                                    </div>
                                    <div className="font-medium text-white">
                                      {user.username}
                                      <span className="ml-2 text-xs bg-primary-900/50 text-primary-400 px-2 py-0.5 rounded-full border border-primary-700/50">
                                        You
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-primary-400 font-semibold">
                                    {user.rating}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </DarkCardBody>
                  </DarkCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardDark;
