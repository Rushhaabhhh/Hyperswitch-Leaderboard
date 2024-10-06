import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSort, FaFilter, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Example data for external contributors
const mockContributors = [
    // Weekly contributors
    { username: 'aliceDev', contributions: 10, points: 1200, github: 'aliceDev', timeframe: 'weekly' },
    { username: 'samSmith', contributions: 8, points: 950, github: 'samSmith', timeframe: 'weekly' },
    { username: 'leoBuilder', contributions: 14, points: 1350, github: 'leoBuilder', timeframe: 'weekly' },
    { username: 'jessCoder', contributions: 11, points: 1280, github: 'jessCoder', timeframe: 'weekly' },
    { username: 'mikeTech', contributions: 9, points: 1180, github: 'mikeTech', timeframe: 'weekly' },

    // Daily contributors
    { username: 'carolTech', contributions: 12, points: 1500, github: 'carolTech', timeframe: 'daily' },
    { username: 'timDev', contributions: 13, points: 1450, github: 'timDev', timeframe: 'daily' },
    { username: 'lucasCode', contributions: 15, points: 1600, github: 'lucasCode', timeframe: 'daily' },
    { username: 'zaraDev', contributions: 9, points: 1200, github: 'zaraDev', timeframe: 'daily' },
    { username: 'ninaTech', contributions: 10, points: 1300, github: 'ninaTech', timeframe: 'daily' },

    // Monthly contributors
    { username: 'bobCoder', contributions: 15, points: 1100, github: 'bobCoder', timeframe: 'monthly' },
    { username: 'juliaTech', contributions: 20, points: 1800, github: 'juliaTech', timeframe: 'monthly' },
    { username: 'peterCode', contributions: 18, points: 1750, github: 'peterCode', timeframe: 'monthly' },
    { username: 'claraDev', contributions: 22, points: 1900, github: 'claraDev', timeframe: 'monthly' },
    { username: 'nickBuilder', contributions: 16, points: 1600, github: 'nickBuilder', timeframe: 'monthly' }
];

const HomePage = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [filterTimeFrame, setFilterTimeFrame] = useState('monthly');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        setLeaderboardData(mockContributors); 
    }, []);

    const handleTimeFrameChange = (e) => {
        setFilterTimeFrame(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value);
    };

    const fetchContributorData = async (username) => {
        return [
            { type: 'Pull Request', description: 'Fixed bug in payment API', date: '2024-10-01' },
            { type: 'Issue', description: 'Resolved issue #123', date: '2024-09-29' },
        ];
    };

    const viewContributorDetails = async (contributor) => {
        const contributions = await fetchContributorData(contributor.username);
        console.log('Contributions:', contributions);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            {/* Navbar */}
            <nav className="bg-black py-4 shadow-md fixed w-full top-0 z-10">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div>
                        <motion.img
                            src="https://hyperswitch.io/logos/hyperswitch.svg"
                            alt="Hyperswitch Logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                        />
                    </div>

                    <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg">
                        <input
                            type="text"
                            placeholder="Search Contributors..."
                            className="bg-gray-800 text-white px-2 py-1 rounded-lg outline-none"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <a href="#leaderboard" className="text-gray-300 hover:text-white">Leaderboard</a>
                        <a href="#about" className="text-gray-300 hover:text-white">About</a>

                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 100 }}
                        >
                            <button className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700">
                                <FaUserCircle className="h-6 w-6 text-white" />
                                <span className="text-white">Profile</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                className="h-96 flex flex-col justify-center items-center text-center mt-16"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <h1 className="text-5xl font-bold text-white">Top External Contributors</h1>
                <p className="mt-4 text-gray-400">Recognizing the best contributors in our community</p>
                <motion.button
                    className="mt-8 px-6 py-3 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-400"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    View Leaderboard
                </motion.button>
            </motion.section>

            {/* Leaderboard Section */}
            <div className="container mx-auto mt-10 px-6 py-8">
                <section id="leaderboard" className="mt-12">
                    <h2 className="text-3xl font-semibold">External Contributor Leaderboard</h2>
                    <p className="text-gray-400 mt-2">Filter and sort contributors by time frame or contribution type.</p>

                    <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center space-x-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                                value={filterTimeFrame}
                                onChange={handleTimeFrameChange}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <FaSort className="text-gray-400" />
                            <select
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                                value={filterCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="all">All</option>
                                <option value="pull-requests">Pull Requests</option>
                                <option value="issues">Issues</option>
                                <option value="commits">Commits</option>
                            </select>
                        </div>
                    </div>

                    <motion.div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="py-2">Rank</th>
                                    <th className="py-2">Username</th>
                                    <th className="py-2">Contributions</th>
                                    <th className="py-2">Points</th>
                                    <th className="py-2">GitHub</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData
                                    .filter(contributor => contributor.timeframe === filterTimeFrame)
                                    .map((contributor, index) => (
                                        <tr key={index} className="border-b border-gray-600 hover:bg-gray-700">
                                            <td className="py-3">{index + 1}</td>
                                            <td className="py-3">{contributor.username}</td>
                                            <td className="py-3">{contributor.contributions}</td>
                                            <td className="py-3">{contributor.points}</td>
                                            <td className="py-3">
                                                <a href={`https://github.com/${contributor.github}`} target="_blank" rel="noopener noreferrer">
                                                    <FaGithub className="text-white" />
                                                </a>
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
                                                    onClick={() => viewContributorDetails(contributor)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </motion.div>
                </section>
            </div>

            {/* Footer Section */}
            <footer className="bg-gray-900 py-6 mt-12">
                <div className="container mx-auto text-center text-gray-400">
                    © {new Date().getFullYear()} Hyperswitch | Open Source Contributions
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
