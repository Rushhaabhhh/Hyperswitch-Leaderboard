import React, { useState, useEffect } from 'react';
import { UserX, Award, Search, UserPlus, UserMinus, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Footer from '../Components/Footer';
import PointsUpdateModal from '../Components/PointsUpdateModal';
import Navbar from '../Components/AdminNavbar';
import AdminManagementModal from '../Components/AdminManagementModal';

const SuperAdminPage = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('points_desc');
    const [activeTab, setActiveTab] = useState('contributors');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const owner = 'juspay';
    const repo = 'hyperswitch';
    const fromDate = '2021-01-01';
    const toDate = new Date();

    // Error auto-dismiss effect
    useEffect(() => {
        let timeoutId;
        if (error) {
            timeoutId = setTimeout(() => {
                setError(null);
                if (activeTab === 'contributors') {
                    fetchLeaderboardData();
                } else {
                    fetchAdminsData();
                }
            }, 1000); 
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [error, activeTab]);

    useEffect(() => {
        if (activeTab === 'contributors') {
            fetchLeaderboardData();
        } else {
            fetchAdminsData();
        }
    }, [sortOrder, activeTab]);

    const fetchLeaderboardData = async () => {
        setLoading(true);
        try {
            await axios.get(`http://localhost:5000/leaderboard/github/fetch/${owner}/${repo}`);
            const response = await axios.get(
                `http://localhost:5000/leaderboard/repo/${owner}/${repo}?sort=${sortOrder}from=${fromDate}&to=${toDate}`
            );
            const { leaderboard = [] } = response.data;
            setUsers(leaderboard);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePoints = async (username, pointsAdded, reason = '') => {
        try {
            // Call backend to update points
            const response = await axios.post(`http://localhost:5000/leaderboard/points/${username}`, {
                pointsToAdd: pointsAdded,
                reason: reason
            });
    
            // Update leaderboard state
            const updatedLeaderboard = leaderboardData.map(contributor => {
                if (contributor.username === username) {
                    return {
                        ...contributor,
                        points: response.data.newPoints, 
                        contributions: contributor.contributions + 1
                    };
                }
                return contributor;
            });
    
            // Re-sort the leaderboard
            const sortedLeaderboard = updatedLeaderboard.sort((a, b) => b.points - a.points);
            
            // Update both leaderboard and filtered data
            setLeaderboardData(sortedLeaderboard);
            setFilteredData(sortedLeaderboard);
    
            // Update users state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.username === username
                        ? { 
                            ...user, 
                            points: response.data.newPoints 
                        }
                        : user
                )
            );
    
            setShowPointsModal(false);
    
        } catch (error) {
            // Handle error scenarios
            console.error('Failed to update points:', error);
            
        }
    };
    
    

    const fetchAdminsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/auth/get-admin`
            );
            setAdmins(response.data || []);
            setError(null); 
        } catch (err) {
            console.error('Error fetching admins:', err);
            setError('Failed to fetch admins');
            setAdmins([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (username) => {
        try {
            await axios.put(
                `http://localhost:5000/leaderboard/users/${username}/type`,
            );
            fetchLeaderboardData();
        } catch (err) {
            setError('Failed to remove user');
        }
    };

    const handleRemoveAdmin = async (admin) => {
        try {
            if (!window.confirm(`Are you sure you want to remove ${admin.fields.Username} as admin? This action cannot be undone.`)) {
                return;
            }

            await axios.delete(
                `http://localhost:5000/auth/remove-admin/${admin.id}`
            );

            // Remove the admin from local state immediately for better UX
            setAdmins(prevAdmins => prevAdmins.filter(a => a.id !== admin.id));

            alert(`${admin.fields.Username} has been removed from admins successfully`);
        } catch (err) {
            console.error('Error removing admin:', err);
            setError(`Failed to remove admin: ${err.response?.data?.message || err.message}`);

            alert('Failed to remove admin. Please try again.');
        }
    };

    const handleAddAdmin = async (adminData) => {
        try {
            await axios.post(
                'http://localhost:5000/auth/assign-admin',
                adminData
            );
            console.log(adminData);
            fetchAdminsData();
        } catch (err) {
            setError('Failed to add admin');
        }
    };


    

    const filteredUsers = users.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredAdmins = admins.filter(admin =>
        admin.fields?.Username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSort = () => {
        setSortOrder(prev => prev === 'points_desc' ? 'points_asc' : 'points_desc');
    };

    return (
        <div className="min-h-screen bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
            {/* Tab navigation and search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            >
                <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('contributors')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            activeTab === 'contributors' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                        Contributors
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            activeTab === 'admins' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                        Admins
                    </button>
                    {/* Search and add buttons */}
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
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
                        {activeTab === 'contributors' ? (
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-400 font-semibold">{user.points}</span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowPointsModal(true);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {user.contributions}
                                            </td>
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
                        ) : (
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-white">Admins Count : {filteredAdmins.length}</p>
                                    <button
                                        onClick={() => setShowAdminModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Add Admin
                                    </button>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-900">
                                            <th className="px-6 py-3 text-left text-white">Admin</th>
                                            <th className="px-6 py-3 text-left text-white">Profile</th>
                                            <th className="px-6 py-3 text-left text-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAdmins.map((admin, index) => (
                                            <motion.tr
                                                key={admin.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-t border-gray-700 hover:bg-gray-750"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-medium">
                                                        {admin.fields.Username}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a 
                                                        href={admin.fields.ProfileLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300"
                                                    >
                                                        GitHub Profile
                                                    </a>
                                                </td>
                                                
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleRemoveAdmin(admin)}
                                                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        <UserMinus className="w-5 h-5" />
                                                        Remove
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

            <PointsUpdateModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        user={selectedUser}
        onUpdate={(username, pointsAdded) => {
            // You might want to pass a reason here as well
            handleUpdatePoints(
                username, 
                pointsAdded, 
                `Manual points adjustment for ${username}`
            );
        }}
    />

            <AdminManagementModal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onAddAdmin={handleAddAdmin}
            />
            <Footer />
        </div>
    );
};

export default SuperAdminPage;