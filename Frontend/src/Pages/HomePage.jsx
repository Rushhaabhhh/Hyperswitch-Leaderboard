import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaGithub, FaPencilAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Dummy user data
const dummyUser = {
    username: 'john_doe',
    created_at: '2023-01-01',
    email: 'john@example.com',
    avatar_url: 'https://via.placeholder.com/150',
    name: 'John Doe',
    bio: 'Web developer and open-source enthusiast.',
    location: 'New York, USA',
    public_repos: 12,
    followers: 100,
    following: 50,
};

const HomePage = () => {
    const [user, setUser] = useState(dummyUser);
    const [githubData, setGithubData] = useState({
        avatar_url: dummyUser.avatar_url,
        name: dummyUser.name,
        bio: dummyUser.bio,
        location: dummyUser.location,
        public_repos: dummyUser.public_repos,
        followers: dummyUser.followers,
        following: dummyUser.following,
    });
    const [profileImage, setProfileImage] = useState(dummyUser.avatar_url);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState(dummyUser.username);
    const [isNameHovered, setIsNameHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Simulate loading
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleProfileImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulate image upload
            const url = URL.createObjectURL(file);
            setProfileImage(url);
        }
    };

    const handleUsernameChange = () => {
        setIsEditingName(false);
        setUser((prev) => ({ ...prev, username: newUsername }));
    };

    const handleLogout = () => {
        setUser(null);
        setGithubData(null);
    };

    if (loading) {
        return <p className="text-white text-center">Loading...</p>;
    }

    if (error) {
        return <p className="text-white text-center">Error: {error}</p>;
    }

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
                    className="h-64 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${profileImage})` }}
                >
                    <label htmlFor="profile-input" className="cursor-pointer">
                        <FaPencilAlt className="absolute inset-0 m-auto text-white cursor-pointer opacity-80" size={40} />
                    </label>
                    <input
                        id="profile-input"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                    />
                </div>

                <div className="absolute top-28 left-8 flex flex-col items-center">
                    <div className="relative group">
                        <img
                            src={profileImage}
                            alt={`${user.username}'s profile`}
                            className="h-44 w-44 rounded-full border-4 border-gray-900 shadow-lg"
                        />
                        <label htmlFor="profile-input" className="cursor-pointer">
                            <FaPencilAlt className="absolute inset-0 m-auto text-white cursor-pointer opacity-80" size={40} />
                        </label>
                        <input
                            id="profile-input"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                        />
                    </div>

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
                            <p className="text-gray-400 text-lg">
                                {githubData.name}
                            </p>
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
                        <p className="text-3xl text-white">{githubData.public_repos}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Followers</h3>
                        <p className="text-3xl text-white">{githubData.followers}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Following</h3>
                        <p className="text-3xl text-white">{githubData.following}</p>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 mx-4">
                <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Logout
                </button>
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
