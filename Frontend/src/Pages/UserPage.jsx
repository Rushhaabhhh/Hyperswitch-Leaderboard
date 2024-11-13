import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowUpDown, Tag } from 'lucide-react';
import Footer from '../Components/Footer.jsx';

// Dummy user data
const dummyUser = {
    username: 'JohnDoe',
    created_at: '2023-01-01',
    email: 'johndoe@example.com',
    profileImage: 'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png',
    githubData: {
        avatar_url: 'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png',
        name: 'John Doe',
        bio: 'Software Developer',
        location: 'San Francisco',
        public_repos: 28,
        followers: 5,
        following: 2,
    }
};

// Dummy contributions data
const dummyContributions = [
    {
        id: 1,
        title: "Add documentation for SDK implementation",
        type: "Documentation",
        status: "Merged",
        date: "2024-02-15",
        points: 25,
        labels: ["documentation", "sdk"],
        url: "#",
        pointBreakdown: {
            complexity: 10,
            impact: 8,
            documentation: 7
        }
    },
    {
        id: 2,
        title: "Fix payment processing bug in checkout flow",
        type: "Bug Fix",
        status: "Merged",
        date: "2024-02-10",
        points: 35,
        labels: ["bug", "critical", "payments"],
        url: "#",
        pointBreakdown: {
            complexity: 15,
            impact: 15,
            bugFix: 5
        }
    },
    {
        id: 3,
        title: "Implement new payment method integration",
        type: "Feature",
        status: "In Review",
        date: "2024-02-05",
        points: 45,
        labels: ["feature", "payment-methods"],
        url: "#",
        pointBreakdown: {
            complexity: 20,
            impact: 15,
            feature: 10
        }
    }
];

const HomePage = () => {
    const [user, setUser] = useState(dummyUser);
    const [backgroundImage, setBackgroundImage] = useState(() => {
        return localStorage.getItem('backgroundImage') || null;
    });
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState(user.username);
    const [isNameHovered, setIsNameHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        setNewUsername(user.username);
    }, [user]);

    const handleBackgroundImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBackgroundImage(imageUrl);
            localStorage.setItem('backgroundImage', imageUrl);
        }
    };

    const handleUsernameChange = () => {
        setUser(prev => ({ ...prev, username: newUsername }));
        setIsEditingName(false);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'merged':
                return 'bg-green-500/20 text-green-400';
            case 'in review':
                return 'bg-yellow-500/20 text-yellow-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const filteredContributions = dummyContributions
        .filter(contribution => selectedType === 'all' || contribution.type.toLowerCase() === selectedType.toLowerCase())
        .sort((a, b) => {
            if (sortOrder === 'date_desc') {
                return new Date(b.date) - new Date(a.date);
            }
            return new Date(a.date) - new Date(b.date);
        });

    return (
        <div className="min-h-screen bg-gray-900">
            <nav className="bg-black py-4 shadow-md fixed w-full top-0 z-10">
                <div className="container pt-2 flex justify-between items-center">
                    <div>
                        <motion.img
                            src="https://hyperswitch.io/logos/hyperswitch.svg"
                            alt="Hyperswitch Logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                        />
                    </div>
                </div>
            </nav>
            <div className="relative top-24">
                <div
                    className="h-64 bg-cover bg-center relative group"
                    style={{ backgroundImage: `url(${backgroundImage || user.githubData.avatar_url})` }}
                >
                    <label htmlFor="background-input" className="cursor-pointer">
                        <FaPencilAlt className="absolute inset-0 m-auto text-white cursor-pointer opacity-0 group-hover:opacity-80" size={40} />
                    </label>
                    <input
                        id="background-input"
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundImageUpload}
                        className="hidden"
                    />
                </div>

                <div className="absolute top-28 left-8 flex flex-col items-center">
                    <img
                        src='https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png'
                        alt={`${user.username}'s profile`}
                        className="h-44 w-44 rounded-full border-4 border-gray-900 shadow-lg"
                    />
                    <div
                        className="mt-2 text-white"
                        onMouseEnter={() => setIsNameHovered(true)}
                        onMouseLeave={() => setIsNameHovered(false)}
                    >
                        {isEditingName ? (
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="bg-gray-700 text-white rounded p-1 text-2xl font-bold"
                                />
                                <button
                                    onClick={handleUsernameChange}
                                    className="ml-2 text-green-400"
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <h1 className="text-4xl font-bold">{newUsername}</h1>
                                {isNameHovered && (
                                    <FaPencilAlt
                                        className="ml-2 text-white cursor-pointer"
                                        size={20}
                                        onClick={() => setIsEditingName(true)}
                                    />
                                )}
                            </div>
                        )}
                        <div className="flex items-center space-x-6 mt-2">
                            <p className="text-gray-400 text-lg">{user.githubData.name}</p>
                            <p className="text-gray-400 text-lg">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* GitHub Stats Section */}
            <div className="mt-64 mx-4">
                <h2 className="text-2xl font-semibold text-white mb-4">GitHub Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Public Repos</h3>
                        <p className="text-3xl text-white">{user.githubData.public_repos}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Followers</h3>
                        <p className="text-3xl text-white">{user.githubData.followers}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Following</h3>
                        <p className="text-3xl text-white">{user.githubData.following}</p>
                    </div>
                </div>
            </div>

            {/* Contributions Section */}
            <div className="mt-12 mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">My Contributions</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="p-2 pl-4 pr-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="documentation">Documentation</option>
                                <option value="bug fix">Bug Fixes</option>
                                <option value="feature">Features</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        
                        <button
                            onClick={() => setSortOrder(prev => prev === 'date_desc' ? 'date_asc' : 'date_desc')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            {sortOrder === 'date_desc' ? 'Newest First' : 'Oldest First'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredContributions.map((contribution) => (
                        <div key={contribution.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <a href={contribution.url} className="text-xl font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                        {contribution.title}
                                    </a>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-gray-400">{new Date(contribution.date).toLocaleDateString()}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(contribution.status)}`}>
                                            {contribution.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {contribution.labels.map((label, idx) => (
                                            <span key={idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                                                <Tag className="w-3 h-3" />
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-400">+{contribution.points} pts</div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        {Object.entries(contribution.pointBreakdown).map(([key, value]) => (
                                            <div key={key} className="capitalize">
                                                {key}: +{value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;