import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSort, FaFilter, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Leaderboard from '../Components/Leaderboard';

const HomePage = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [filterTimeFrame, setFilterTimeFrame] = useState('monthly');
    const [filterCategory, setFilterCategory] = useState('all');
    const [loading, setLoading] = useState(true);  // Loading state
    const [error, setError] = useState(null);      // Error state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/user');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setLeaderboardData(data); 
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);  // Set loading to false once the fetch is complete
            }
        };
        fetchData();
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
            <Leaderboard />

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
