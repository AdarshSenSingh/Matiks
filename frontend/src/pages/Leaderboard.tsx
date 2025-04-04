import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface LeaderboardEntry {
  rank: number;
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  rating: number;
}

type SortField =
  | "rank"
  | "username"
  | "gamesPlayed"
  | "gamesWon"
  | "winRate"
  | "rating";
type SortDirection = "asc" | "desc";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    // This is a placeholder for the actual API call
    const fetchLeaderboard = () => {
      // Simulate API call
      setTimeout(() => {
        const mockData: LeaderboardEntry[] = [
          {
            rank: 1,
            username: "MathWizard",
            gamesPlayed: 120,
            gamesWon: 98,
            winRate: 81.7,
            rating: 2450,
          },
          {
            rank: 2,
            username: "NumberNinja",
            gamesPlayed: 95,
            gamesWon: 76,
            winRate: 80.0,
            rating: 2380,
          },
          {
            rank: 3,
            username: "CalculusKing",
            gamesPlayed: 150,
            gamesWon: 115,
            winRate: 76.7,
            rating: 2310,
          },
          {
            rank: 4,
            username: "AlgebraMaster",
            gamesPlayed: 88,
            gamesWon: 65,
            winRate: 73.9,
            rating: 2275,
          },
          {
            rank: 5,
            username: "PrimeTime",
            gamesPlayed: 110,
            gamesWon: 80,
            winRate: 72.7,
            rating: 2240,
          },
          {
            rank: 6,
            username: "LogicLord",
            gamesPlayed: 75,
            gamesWon: 54,
            winRate: 72.0,
            rating: 2190,
          },
          {
            rank: 7,
            username: "EquationExpert",
            gamesPlayed: 130,
            gamesWon: 92,
            winRate: 70.8,
            rating: 2150,
          },
          {
            rank: 8,
            username: "StatisticsStorm",
            gamesPlayed: 85,
            gamesWon: 60,
            winRate: 70.6,
            rating: 2120,
          },
          {
            rank: 9,
            username: "GeometryGenius",
            gamesPlayed: 95,
            gamesWon: 66,
            winRate: 69.5,
            rating: 2080,
          },
          {
            rank: 10,
            username: "TrigonometryTitan",
            gamesPlayed: 105,
            gamesWon: 72,
            winRate: 68.6,
            rating: 2050,
          },
          {
            rank: 11,
            username: "FractionFanatic",
            gamesPlayed: 92,
            gamesWon: 62,
            winRate: 67.4,
            rating: 2020,
          },
          {
            rank: 12,
            username: "DecimalDominator",
            gamesPlayed: 115,
            gamesWon: 77,
            winRate: 67.0,
            rating: 2000,
          },
          {
            rank: 13,
            username: "RadicalReasoner",
            gamesPlayed: 78,
            gamesWon: 52,
            winRate: 66.7,
            rating: 1980,
          },
          {
            rank: 14,
            username: "VectorVictor",
            gamesPlayed: 102,
            gamesWon: 67,
            winRate: 65.7,
            rating: 1960,
          },
          {
            rank: 15,
            username: "MatrixMaster",
            gamesPlayed: 88,
            gamesWon: 57,
            winRate: 64.8,
            rating: 1940,
          },
        ];

        setLeaderboard(mockData);
        setFilteredLeaderboard(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchLeaderboard();
  }, []);

  // Filter and sort leaderboard
  useEffect(() => {
    let result = [...leaderboard];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((entry) =>
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "rank":
          comparison = a.rank - b.rank;
          break;
        case "username":
          comparison = a.username.localeCompare(b.username);
          break;
        case "gamesPlayed":
          comparison = a.gamesPlayed - b.gamesPlayed;
          break;
        case "gamesWon":
          comparison = a.gamesWon - b.gamesWon;
          break;
        case "winRate":
          comparison = a.winRate - b.winRate;
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        default:
          comparison = a.rank - b.rank;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredLeaderboard(result);
  }, [leaderboard, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending for most fields (except username)
      setSortField(field);
      setSortDirection(field === "username" ? "asc" : "desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;

    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center">
              <TrophyIcon className="h-10 w-10 text-yellow-500 mr-3" />
              Global Leaderboard
            </h1>
          </motion.div>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Top players ranked by their performance in HectoClash duels. Compete
            and climb the ranks!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Search and filter controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>
                  Showing {filteredLeaderboard.length} of {leaderboard.length}{" "}
                  players
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <ArrowPathIcon className="animate-spin h-10 w-10 text-primary-500" />
              <span className="ml-3 text-xl text-gray-700">
                Loading leaderboard data...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("rank")}
                    >
                      Rank {getSortIcon("rank")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("username")}
                    >
                      Player {getSortIcon("username")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("gamesPlayed")}
                    >
                      Games Played {getSortIcon("gamesPlayed")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("gamesWon")}
                    >
                      Games Won {getSortIcon("gamesWon")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("winRate")}
                    >
                      Win Rate {getSortIcon("winRate")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("rating")}
                    >
                      Rating {getSortIcon("rating")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard.map((entry) => (
                      <motion.tr
                        key={entry.rank}
                        className="hover:bg-gray-50 transition-colors duration-150"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: entry.rank * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`
                              ${getRankBadgeColor(entry.rank)}
                              w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                            `}
                            >
                              {entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                              {entry.username.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {entry.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                Member since 2023
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {entry.gamesPlayed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {entry.gamesWon}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.winRate.toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full"
                              style={{ width: `${entry.winRate}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {entry.rating}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No players found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leaderboard info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            About the Leaderboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Rating System
              </h3>
              <p className="text-gray-600 text-sm">
                Players are ranked using an ELO-based rating system. Win against
                higher-rated players to gain more points!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Seasons</h3>
              <p className="text-gray-600 text-sm">
                Leaderboards reset every month. Top players receive special
                badges and rewards at the end of each season.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Ranking Criteria
              </h3>
              <p className="text-gray-600 text-sm">
                Rankings are primarily determined by player rating, which is
                affected by wins, losses, and the skill level of opponents.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
