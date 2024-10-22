import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
        public_repos: 10,
        followers: 5,
        following: 2,
    }
};

const HomePage = () => {
    const [user, setUser] = useState(dummyUser);
    const [backgroundImage, setBackgroundImage] = useState(() => {
        return localStorage.getItem('backgroundImage') || null;
    });
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState(user.username);
    const [isNameHovered, setIsNameHovered] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Setting the username when component mounts
        setNewUsername(user.username);
    }, [user]);

    const handleBackgroundImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file); // Create a local URL for the image
            setBackgroundImage(imageUrl);
            localStorage.setItem('backgroundImage', imageUrl); // Save to local storage
        }
    };

    const handleUsernameChange = () => {
        setUser(prev => ({ ...prev, username: newUsername }));
        setIsEditingName(false);
    };

    const handleGitHubLogin = () => {
        // Placeholder for GitHub login functionality
        window.location.href = 'http://localhost:5000/auth/github';
    };

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

            {/* Logout Button */}
            <div className="mt-8 mx-4">
                <button 
                    onClick={handleGitHubLogin}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Login with GitHub
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
