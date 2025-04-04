import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import {
  UserCircleIcon,
  TrophyIcon,
  ClockIcon,
  PencilIcon,
  ChartBarIcon,
  FireIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { DarkButton, DarkCard, DarkCardBody } from "../components/ui";
import { MathBackgroundStatic } from "../components/animations";

const ProfileDark = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate join date
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "April 2023";

  // Mock game history data
  const gameHistory = [
    {
      id: 1,
      date: "2023-04-01",
      opponent: "MathWizard",
      result: "win",
      score: "100-95",
    },
    {
      id: 2,
      date: "2023-04-02",
      opponent: "NumberNinja",
      result: "loss",
      score: "87-100",
    },
    {
      id: 3,
      date: "2023-04-03",
      opponent: "CalculusKing",
      result: "win",
      score: "100-82",
    },
    {
      id: 4,
      date: "2023-04-04",
      opponent: "AlgebraMaster",
      result: "win",
      score: "100-90",
    },
    {
      id: 5,
      date: "2023-04-05",
      opponent: "PrimeTime",
      result: "loss",
      score: "76-100",
    },
  ];

  // Mock achievements data
  const achievements = [
    {
      id: 1,
      name: "First Victory",
      description: "Win your first game",
      completed: true,
      icon: <TrophyIcon className="h-6 w-6" />,
    },
    {
      id: 2,
      name: "Math Prodigy",
      description: "Reach a rating of 1500",
      completed: false,
      icon: <StarIcon className="h-6 w-6" />,
    },
    {
      id: 3,
      name: "Winning Streak",
      description: "Win 5 games in a row",
      completed: true,
      icon: <FireIcon className="h-6 w-6" />,
    },
    {
      id: 4,
      name: "Problem Solver",
      description: "Solve 100 math problems",
      completed: false,
      icon: <CheckCircleIcon className="h-6 w-6" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement profile update
      console.log("Update profile:", { username, email });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background animation - using static version to prevent re-renders */}
      <div className="absolute inset-0 opacity-5 overflow-hidden">
        <MathBackgroundStatic
          speed={0.3}
          size={30}
          color="rgba(79, 70, 229, 0.2)"
        />
      </div>

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DarkCard>
          <DarkCardBody>
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 -mx-6 -mt-6 p-8 border-b border-gray-700 rounded-t-xl">
              <div className="flex flex-col md:flex-row items-center">
                <motion.div
                  className="h-28 w-28 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0 md:mr-6 shadow-lg border-2 border-primary-500/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {user?.username.charAt(0).toUpperCase()}
                  <motion.div
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-gray-800"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white">
                    {user?.username}
                  </h1>
                  <p className="text-gray-400 flex items-center justify-center md:justify-start">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Member since {joinDate}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4">
                    <motion.div
                      className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrophyIcon className="h-5 w-5 mr-2 text-primary-400" />
                      <span className="text-white">
                        Rating: {user?.rating || 1000}
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ClockIcon className="h-5 w-5 mr-2 text-accent-400" />
                      <span className="text-white">Games: 42</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FireIcon className="h-5 w-5 mr-2 text-orange-400" />
                      <span className="text-white">
                        Streak: {user?.streak || 0}
                      </span>
                    </motion.div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsEditing(!isEditing)}
                  className="ml-auto mt-4 md:mt-0 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center border border-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 mt-6 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "games"
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("games")}
              >
                Game History
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "achievements"
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("achievements")}
              >
                Achievements
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </button>
            </div>

            {/* Profile Content */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <DarkButton
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                      >
                        Save Changes
                      </DarkButton>
                      <DarkButton
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </DarkButton>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div>
                        <h2 className="text-xl font-bold mb-4 text-white">
                          Profile Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-sm text-gray-400">Username</p>
                            <p className="font-medium text-white">
                              {user?.username}
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-sm text-gray-400">Email</p>
                            <p className="font-medium text-white">
                              {user?.email}
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-sm text-gray-400">Rating</p>
                            <p className="font-medium text-white">
                              {user?.rating || 1000}
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-sm text-gray-400">Rank</p>
                            <p className="font-medium text-white">42nd</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-bold mb-4 text-white">
                          Game Statistics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <motion.div
                            className="bg-gray-800/50 p-4 rounded-lg border border-green-700/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <p className="text-sm text-gray-400">Wins</p>
                            <div className="flex items-center">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                              <p className="text-2xl font-bold text-green-500">
                                28
                              </p>
                            </div>
                          </motion.div>
                          <motion.div
                            className="bg-gray-800/50 p-4 rounded-lg border border-red-700/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <p className="text-sm text-gray-400">Losses</p>
                            <div className="flex items-center">
                              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                              <p className="text-2xl font-bold text-red-500">
                                14
                              </p>
                            </div>
                          </motion.div>
                          <motion.div
                            className="bg-gray-800/50 p-4 rounded-lg border border-blue-700/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <p className="text-sm text-gray-400">Win Rate</p>
                            <div className="flex items-center">
                              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <p className="text-2xl font-bold text-blue-500">
                                66.7%
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                          <ChartBarIcon className="h-5 w-5 mr-2 text-primary-400" />
                          Rating History
                        </h2>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 h-64 flex items-center justify-center">
                          <p className="text-gray-400">
                            Rating chart coming soon...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "games" && (
                    <motion.div
                      key="games"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-xl font-bold mb-4 text-white">
                        Recent Games
                      </h2>
                      <div className="overflow-x-auto rounded-lg border border-gray-700">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead className="bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                              >
                                Opponent
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                              >
                                Result
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                              >
                                Score
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-900 divide-y divide-gray-800">
                            {gameHistory.map((game, index) => (
                              <motion.tr
                                key={game.id}
                                className="hover:bg-gray-800/50 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: index * 0.05,
                                }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {game.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-white">
                                    {game.opponent}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      game.result === "win"
                                        ? "bg-green-900/50 text-green-400 border border-green-700/50"
                                        : "bg-red-900/50 text-red-400 border border-red-700/50"
                                    }`}
                                  >
                                    {game.result === "win" ? "Win" : "Loss"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {game.score}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "achievements" && (
                    <motion.div
                      key="achievements"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-xl font-bold mb-4 text-white">
                        Achievements
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.id}
                            className={`p-4 rounded-lg border ${
                              achievement.completed
                                ? "bg-primary-900/20 border-primary-700/30"
                                : "bg-gray-800/50 border-gray-700/50"
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start">
                              <div
                                className={`p-2 rounded-full mr-3 ${
                                  achievement.completed
                                    ? "bg-primary-900/50 text-primary-400"
                                    : "bg-gray-700/50 text-gray-400"
                                }`}
                              >
                                {achievement.icon}
                              </div>
                              <div>
                                <h3 className="font-bold text-white flex items-center">
                                  {achievement.name}
                                  {achievement.completed && (
                                    <CheckCircleIcon className="h-4 w-4 ml-2 text-green-500" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {achievement.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-xl font-bold mb-4 text-white">
                        Account Settings
                      </h2>
                      <div className="space-y-6">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                          <h3 className="font-medium text-white mb-2">
                            Change Password
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Update your password to keep your account secure
                          </p>
                          <DarkButton variant="secondary">
                            Change Password
                          </DarkButton>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                          <h3 className="font-medium text-white mb-2">
                            Notification Settings
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Manage your email notification preferences
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="notify-games"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
                                defaultChecked
                              />
                              <label
                                htmlFor="notify-games"
                                className="ml-2 text-sm text-gray-300"
                              >
                                Game invitations and results
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="notify-achievements"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
                                defaultChecked
                              />
                              <label
                                htmlFor="notify-achievements"
                                className="ml-2 text-sm text-gray-300"
                              >
                                New achievements
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
                          <h3 className="font-medium text-white mb-2">
                            Danger Zone
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Permanently delete your account and all associated
                            data
                          </p>
                          <DarkButton variant="danger">
                            Delete Account
                          </DarkButton>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </DarkCardBody>
        </DarkCard>
      </motion.div>
    </div>
  );
};

export default ProfileDark;
