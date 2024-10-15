import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronDown, Filter, Github } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';

// New Loader component
const Loader = () => (
  <motion.div
    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const owner = 'juspay';
  const repo = 'hyperswitch';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/leaderboard/repo/${owner}/${repo}?timeFrame=${timeFrame}`);
        const { leaderboard = [], totalItems = 0 } = response.data;

        setLeaderboardData(leaderboard);
        setFilteredData(leaderboard);
        setTotalItems(totalItems);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      const filtered = leaderboardData.filter(contributor =>
        contributor.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }, 300),
    [leaderboardData]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleToggleExpand = (username) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[rgb(40,54,82)]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="mt-4 text-center text-red-500">{error}</div>;
  }

  const getContributionTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'bug':
        return '🐛';
      case 'issue':
        return '❗';
      case 'feature':
        return '✨';
      case 'documentation':
        return '📚';
      default:
        return '🔧';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto mt-2 px-6 py-8 bg-[rgb(40,54,82)] min-h-screen"
    >
      <h2 className="text-5xl font-bold text-center mb-12 text-white">Leaderboard</h2>

      <div className="flex items-center justify-between mt-4">
        <div className="relative w-152">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="p-3 pl-4 pr-10 border border-gray-800 rounded-full bg-gray-700  text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md w-full"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white">
            <ChevronDown size={18} />
          </span>
        </div>

        <div className="relative w-1/3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username"
            className="p-3 pl-10 rounded-full text-md  bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg w-full"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center bg-blue-700 text-white px-4 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
        >
          <span className="mr-2">
            <Filter size={22} />
          </span>
          Sort
        </motion.button>
      </div>

      {filteredData.length > 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-6 bg-gray-700 rounded-lg shadow overflow-hidden"
        >
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">GitHub</th>
                <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">Contributions</th>
                <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-md font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {filteredData.map((contributor, index) => (
                <React.Fragment key={contributor.username}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{contributor.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.a
                        href={`https://github.com/${contributor.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-white hover:text-blue-300 flex items-center"
                      >
                        <Github size={20} className="mr-2" />
                        <span className="hidden md:inline">{contributor.username}</span>
                      </motion.a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{contributor.contributions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{contributor.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleExpand(contributor.username)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {expandedUser === contributor.username ? 'Hide Details' : 'Show Details'}
                      </motion.button>
                    </td>
                  </motion.tr>
                  {expandedUser === contributor.username && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td colSpan="6" className="px-6 py-4 bg-gray-800">
                        <h4 className="font-semibold mb-2 text-white">Contribution Details:</h4>
                        <ul className="space-y-2 text-white">
                          {contributor.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">{getContributionTypeIcon(detail.type)}</span>
                              <span className="font-medium mr-2">{detail.type}:</span>
                              <a 
                                href={detail.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:underline mr-2"
                              >
                                {detail.title}
                              </a>
                              <span className="text-green-400">({detail.points} points)</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <div className="mt-4 text-center text-white">No contributors found.</div>
      )}

      <p className="mt-6 text-xl text-white">Total External Contributors: {totalItems}</p>
    </motion.div>
  );
};

export default Leaderboard;