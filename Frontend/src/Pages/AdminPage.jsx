import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { UserX, Award, Search, ArrowUpDown } from 'lucide-react';

import Footer from '../Components/Footer';
import Navbar from '../Components/AdminNavbar';
import PointsUpdateModal from '../Components/PointsUpdateModal';

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [sortMethod, setSortMethod] = useState('points_desc');

  const repoName = import.meta.env.VITE_REPO;
  const repoOwner = import.meta.env.VITE_OWNER;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchContributorData();
  }, [sortMethod]);

  const fetchContributorData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/leaderboard/${repoOwner}/${repoName}/external?sort=${sortMethod}`
      );
      setContributors(response.data.leaderboard || []);
    } catch (err) {
      setFetchError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContributor = async (username) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/leaderboard/${repoOwner}/${repoName}/contributor/${username}`
      );
      fetchContributorData();
    } catch (err) {
      setFetchError('Failed to remove contributor');
    }
  };

  const handlePointsUpdate = async (username, pointsToAdd, reason = '') => {
    try {
      // Validate inputs
      if (!username || !pointsToAdd) {
        throw new Error('Username and points are required');
      }

      // Call backend to update points
      const response = await axios.patch(
        `${API_BASE_URL}/leaderbaord/users/${username}/points`, 
        { 
          pointsToAdd, 
          reason 
        }
      );

      // Destructure response for clarity
      const { 
        newPoints, 
        username: updatedUsername, 
        updatedAt 
      } = response.data;

      // Update users state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.username === updatedUsername 
            ? { 
            ...user, 
            points: newPoints,
            lastPointUpdate: updatedAt 
            } 
          : user
        )
      );


      // Re-sort if needed
      setUsers(prev => [...prev].sort((a, b) => b.points - a.points));

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update points';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const filteredContributors = contributors.filter(contributor =>
    contributor.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSorting = () => {
    setSortMethod(prev => (prev === 'points_desc' ? 'points_asc' : 'points_desc'));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Contributors Dashboard</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search contributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={toggleSorting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortMethod === 'points_desc' ? 'Highest Points' : 'Lowest Points'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Award className="w-4 h-4" />
              Update Points
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            {fetchError}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-3 text-left text-white">Contributor</th>
                  <th className="px-6 py-3 text-left text-white">Points</th>
                  <th className="px-6 py-3 text-left text-white">Contributions</th>
                  <th className="px-6 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributors.map((contributor, index) => (
                  <motion.tr
                    key={contributor.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-gray-700 hover:bg-gray-750"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-white font-medium">{contributor.username}</div>
                          {contributor.isFirstTime && (
                            <span className="text-xs text-green-400">First Time Contributor!</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-400 font-semibold">{contributor.points}</td>
                    <td className="px-6 py-4 text-gray-400">{contributor.contributions}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemoveContributor(contributor.username)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

      <PointsUpdateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contributors={contributors}
        onUpdate={handlePointsUpdate}
      />
      <Footer />
    </div>
  );
};

export default AdminPage;
