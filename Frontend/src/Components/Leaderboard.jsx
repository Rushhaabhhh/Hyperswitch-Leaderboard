import React, { useEffect, useState } from 'react';
import { Search, ArrowUpDown, Github, Trophy, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('points_desc');

  const owner = 'juspay';
  const repo = 'hyperswitch';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/leaderboard/repo/${owner}/${repo}?timeFrame=${timeFrame}&sort=${sortOrder}`
        );
        const { leaderboard = [] } = response.data;
        setLeaderboardData(leaderboard);
        setFilteredData(leaderboard);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame, sortOrder]);

  useEffect(() => {
    const filtered = leaderboardData.filter(contributor =>
      contributor.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, leaderboardData]);

  const handleToggleExpand = (username) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  const toggleSort = () => {
    setSortOrder(prev => 
      prev === 'points_desc' ? 'points_asc' : 'points_desc'
    );
  };

  const getPointsColor = (points) => {
    if (points >= 100) return 'text-yellow-400';
    if (points >= 50) return 'text-blue-400';
    return 'text-white';
  };

  const getRankBadge = (rank) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return rank;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="mt-4 text-center text-red-500">{error}</div>;
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.h2 
          className="text-4xl font-bold text-white mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Community Contributors
        </motion.h2>
        <motion.p 
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Recognizing our valuable contributors
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="w-full p-3 pl-4 pr-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contributors..."
            className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          onClick={toggleSort}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowUpDown className="w-5 h-5" />
          {sortOrder === 'points_desc' ? 'Highest Points' : 'Lowest Points'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contributor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Points</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contributions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredData.map((contributor, index) => (
                <React.Fragment key={contributor.username}>
                  <motion.tr 
                    className="hover:bg-gray-700 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4 text-gray-300">
                      {getRankBadge(index + 1)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://github.com/${contributor.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                        >
                          <Github className="w-5 h-5" />
                          {contributor.username}
                        </a>
                        {contributor.isFirstTime && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                            First Time!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${getPointsColor(contributor.points)}`}>
                      {contributor.points} pts
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {contributor.contributions}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleExpand(contributor.username)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {expandedUser === contributor.username ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </motion.tr>
                  {expandedUser === contributor.username && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-750">
                        <div className="space-y-3">
                          {contributor.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-4 text-gray-300">
                              <div className="flex-1">
                                <a 
                                  href={detail.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {detail.title}
                                </a>
                                <div className="flex gap-2 mt-1">
                                  {detail.labels.map((label, labelIdx) => (
                                    <span 
                                      key={labelIdx}
                                      className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-sm">
                                <div className="font-medium text-green-400">
                                  +{detail.pointsEarned} points
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {Object.entries(detail.pointBreakdown).map(([key, value]) => 
                                    key !== 'total' && value > 0 && (
                                      <div key={key}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}: +{value}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
