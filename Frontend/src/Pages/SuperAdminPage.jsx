import React, { useState, useEffect } from 'react';
import { UserX, Award, Search, UserPlus, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Footer from '../Components/Footer';
import PointsUpdateModal from '../Components/PointsUpdateModal';
import Navbar from '../Components/AdminNavbar';


// New Admin Management Modal
const AdminManagementModal = ({ isOpen, onClose, onAddAdmin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAddAdmin({ username, email, role });
              setUsername('');
              setEmail('');
              setRole('admin');
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Admin
          </button>
        </div>
      </div>
    </div>
  );
};

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

    const owner = 'juspay';
    const repo = 'hyperswitch';

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
            const response = await axios.get(
                `http://localhost:5000/leaderboard/repo/${owner}/${repo}?sort=${sortOrder}`
            );
            const { leaderboard = [] } = response.data;
            setUsers(leaderboard);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/admins`
            );
            setAdmins(response.data);
        } catch (err) {
            setError('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (username) => {
        try {
            await axios.delete(
                `http://localhost:5000/leaderboard/repo/${owner}/${repo}/contributor/${username}`
            );
            fetchLeaderboardData();
        } catch (err) {
            setError('Failed to remove user');
        }
    };

    const handleRemoveAdmin = async (username) => {
        try {
            await axios.delete(
                `http://localhost:5000/admins/${username}`
            );
            fetchAdminsData();
        } catch (err) {
            setError('Failed to remove admin');
        }
    };

    const handleAddAdmin = async (adminData) => {
        try {
            await axios.post(
                'http://localhost:5000/admins',
                adminData
            );
            fetchAdminsData();
        } catch (err) {
            setError('Failed to add admin');
        }
    };

    const handleUpdatePoints = async (username, points, reason) => {
        try {
            await axios.patch(
                `http://localhost:5000/leaderboard/repo/${owner}/${repo}/contributor/${username}/points`,
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

    const filteredAdmins = admins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
                    
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="flex gap-4 mb-4 md:mb-0">
                            <button
                                onClick={() => setActiveTab('contributors')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    activeTab === 'contributors'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-800 text-gray-300'
                                }`}
                            >
                                Contributors
                            </button>
                            <button
                                onClick={() => setActiveTab('admins')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    activeTab === 'admins'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-800 text-gray-300'
                                }`}
                            >
                                Admins
                            </button>
                        </div>

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

                        {activeTab === 'admins' && (
                            <button
                                onClick={() => setShowAdminModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <UserPlus className="w-5 h-5" />
                                Add Admin
                            </button>
                        )}

                        {activeTab === 'contributors' && (
                            <button
                                onClick={toggleSort}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                {sortOrder === 'points_desc' ? 'Highest Points' : 'Lowest Points'}
                            </button>
                        )}
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
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-900">
                                        <th className="px-6 py-3 text-left text-white">Username</th>
                                        <th className="px-6 py-3 text-left text-white">Email</th>
                                        <th className="px-6 py-3 text-left text-white">Role</th>
                                        <th className="px-6 py-3 text-left text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmins.map((admin, index) => (
                                        <motion.tr
                                            key={admin.username}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-t border-gray-700 hover:bg-gray-750"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{admin.username}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {admin.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    admin.role === 'admin' 
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleRemoveAdmin(admin.username)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <UserX className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                )}
                </main>
    
            <PointsUpdateModal
                isOpen={showPointsModal}
                onClose={() => setShowPointsModal(false)}
                user={selectedUser}
                onUpdate={handleUpdatePoints}
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