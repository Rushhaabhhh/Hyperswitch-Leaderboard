import axios from 'axios';
import { format } from "date-fns";
import { motion } from 'framer-motion';
import React, { useEffect, useState, useCallback } from 'react';
import { Search, ArrowUpDown, Github, Trophy, ChevronDown } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

const Leaderboard = () => {
  const [contributors, setContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('points_desc');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [expandedContributor, setExpandedContributor] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const repoName = import.meta.env.VITE_REPO;
  const repoOwner = import.meta.env.VITE_OWNER;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchContributors = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { from, to } = dateRange;
      const response = await axios.get(
        `${API_BASE_URL}/leaderboard/${repoOwner}/${repoName}/External`, 
        {
          params: {
            sort: sortOrder,
            startDate: from.toISOString(),
            endDate: to.toISOString()
          }
        }
      );

      const { leaderboard = [] } = response.data;
      setContributors(leaderboard);
      setFilteredContributors(leaderboard);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [repoOwner, repoName, dateRange, sortOrder, API_BASE_URL]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  useEffect(() => {
    const filtered = contributors.filter(({ username }) =>
      username.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredContributors(filtered);
  }, [searchText, contributors]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'points_desc' ? 'points_asc' : 'points_desc'));
  };

  const toggleExpandedContributor = (username) => {
    setExpandedContributor(expandedContributor === username ? null : username);
  };

  const getPointsClass = (points) => {
    if (points >= 100) return 'text-yellow-400';
    if (points >= 50) return 'text-blue-400';
    return 'text-white';
  };

  const renderRankBadge = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Trophy className="w-6 h-6 text-amber-600" />;
      default: return rank;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage) {
    return <div className="mt-4 text-center text-red-500">{errorMessage}</div>;
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
        <div className="relative">
          <button
            onClick={() => setIsCalendarVisible(!isCalendarVisible)}
            className="w-full md:w-auto px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 flex items-center gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            {dateRange.from && dateRange.to ? (
              `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
            ) : (
              'Pick a date range'
            )}
          </button>
          {isCalendarVisible && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <DateRangePicker
                initialSelected={dateRange}
                onConfirm={(newRange) => {
                  setDateRange(newRange);
                  setIsCalendarVisible(false);
                  fetchContributors();
                }}
              />
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search contributors..."
            className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          onClick={() => {
            toggleSortOrder();
            fetchContributors(); 
          }}
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
              {filteredContributors.map((contributor, index) => (
                <React.Fragment key={contributor.username}>
                  <motion.tr 
                    className="hover:bg-gray-700 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4 text-gray-300">
                      {renderRankBadge(index + 1)}
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
                    <td className={`px-6 py-4 font-semibold ${getPointsClass(contributor.points)}`}>
                      {contributor.points} pts
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {contributor.contributions}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleExpandedContributor(contributor.username)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {expandedContributor === contributor.username ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </motion.tr>
                  {expandedContributor === contributor.username && (
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