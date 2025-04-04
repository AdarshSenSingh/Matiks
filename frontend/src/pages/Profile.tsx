import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { UserCircleIcon, TrophyIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  // Mock game history data
  const gameHistory = [
    { id: 1, date: '2023-04-01', opponent: 'MathWizard', result: 'win', score: '100-95' },
    { id: 2, date: '2023-04-02', opponent: 'NumberNinja', result: 'loss', score: '87-100' },
    { id: 3, date: '2023-04-03', opponent: 'CalculusKing', result: 'win', score: '100-82' },
    { id: 4, date: '2023-04-04', opponent: 'AlgebraMaster', result: 'win', score: '100-90' },
    { id: 5, date: '2023-04-05', opponent: 'PrimeTime', result: 'loss', score: '76-100' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    console.log('Update profile:', { username, email });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-primary-700 text-4xl font-bold mb-4 md:mb-0 md:mr-6">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">{user?.username}</h1>
                <p className="text-primary-100">Member since April 2023</p>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center">
                    <TrophyIcon className="h-5 w-5 mr-1" />
                    <span>Rating: {user?.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-1" />
                    <span>Games: 42</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="ml-auto mt-4 md:mt-0 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{user?.username}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-medium">{user?.rating}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Rank</p>
                      <p className="font-medium">42nd</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Game Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-500">Wins</p>
                      <p className="text-2xl font-bold text-green-600">28</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-sm text-gray-500">Losses</p>
                      <p className="text-2xl font-bold text-red-600">14</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-500">Win Rate</p>
                      <p className="text-2xl font-bold text-blue-600">66.7%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Games</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Opponent
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {gameHistory.map((game) => (
                          <tr key={game.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {game.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{game.opponent}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                game.result === 'win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {game.result === 'win' ? 'Win' : 'Loss'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {game.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
