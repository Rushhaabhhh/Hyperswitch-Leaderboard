import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { UserX, Award, Search, ArrowUpDown } from 'lucide-react';

import Footer from '../Components/Footer';
import Navbar from '../Components/AdminNavbar';
import PointsUpdateModal from '../Components/PointsUpdateModal';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('points_desc');

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const owner = process.env.REACT_APP_OWNER;
    const repo = process.env.REACT_APP_REPO;

    useEffect(() => {
        fetchLeaderboardData();
    }, [sortOrder]);

    const fetchLeaderboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/leaderboard/repo/${owner}/${repo}?sort=${sortOrder}`
            );
            const { leaderboard = [] } = response.data;
            setUsers(leaderboard);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (username) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/leaderboard/repo/${owner}/${repo}/contributor/${username}`
            );
            fetchLeaderboardData();
        } catch (err) {
            setError('Failed to remove user');
        }
    };

    const handleUpdatePoints = async (username, points, reason) => {
        try {
            await axios.patch(
                `${API_BASE_URL}/leaderboard/repo/${owner}/${repo}/contributor/${username}/points`,
                { pointsToAdd: points, reason }
            );
            await fetchLeaderboardData();
        } catch (err) {
            setError('Failed to update points');
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSort = () => {
        setSortOrder(prev => prev === 'points_desc' ? 'points_asc' : 'points_desc');
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={toggleSort}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            {sortOrder === 'points_desc' ? 'Highest Points' : 'Lowest Points'}
                        </button>
                        <button
                            onClick={() => setShowPointsModal(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                        >
                            <Award className="w-4 h-4" />
                            Update Points
                        </button>
                    </div>
                </motion.div>
    
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64 text-red-500">
                        {error}
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
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.username}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-t border-gray-700 hover:bg-gray-750"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <div className="text-white font-medium">{user.username}</div>
                                                    {user.isFirstTime && (
                                                        <span className="text-xs text-green-400">First Time Contributor!</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-green-400 font-semibold">{user.points}</td>
                                        <td className="px-6 py-4 text-gray-400">{user.contributions}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRemoveUser(user.username)}
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
                isOpen={showPointsModal}
                onClose={() => setShowPointsModal(false)}
                users={users} // Pass users list to allow selection within modal
                onUpdate={handleUpdatePoints}
            />
            <Footer />
        </div>
    ); 
};

export default AdminPage;
