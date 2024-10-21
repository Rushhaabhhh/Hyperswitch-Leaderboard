import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaGithub, FaPencilAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HomePage = () => {
    const [user, setUser] = useState(null);
    const [githubData, setGithubData] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(() => {
        return localStorage.getItem('backgroundImage') || null;
    });
    const [profileImage, setProfileImage] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isNameHovered, setIsNameHovered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await axios.get('http://localhost:5000/auth/user');
                setUser(userResponse.data);
                setNewUsername(userResponse.data.username);

                const githubResponse = await axios.get('http://localhost:5000/auth/github-data');
                setGithubData(githubResponse.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                setProfileImage(reader.result);
                try {
                    await axios.put(`http://localhost:5000/auth/update/${user.id}`, { 
                        image: reader.result
                    });
                } catch (error) {
                    console.error('Error updating profile image:', error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundImage(reader.result);
                localStorage.setItem('backgroundImage', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUsernameChange = async () => {
        try {
            await axios.put(`http://localhost:5000/auth/update/${user.id}`, { username: newUsername });
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating username:', error);
        }
    };

    const handleGitHubLogin = () => {
        window.location.href = 'http://localhost:5000/auth/github';
    };

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/auth/logout');
            setUser(null);
            setGithubData(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return <p className="text-white text-center">Loading...</p>;
    }

    if (error) {
        return <p className="text-white text-center">Error: {error}</p>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <button 
                    onClick={handleGitHubLogin}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <FaGithub className="mr-2" />
                    Login with GitHub
                </button>
            </div>
        );
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
                    className="h-64 bg-cover bg-center relative group"
                    style={{ backgroundImage: `url(${backgroundImage || githubData?.avatar_url})` }}
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
                    <div className="relative group">
                        <img
                            src={profileImage || githubData?.avatar_url}
                            alt={`${user.username}'s profile`}
                            className="h-44 w-44 rounded-full border-4 border-gray-900 shadow-lg"
                        />
                        <label htmlFor="profile-input" className="cursor-pointer">
                            <FaPencilAlt className="absolute inset-0 m-auto text-white cursor-pointer opacity-0 group-hover:opacity-80" size={40} />
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
                                {githubData?.name}
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
                        <p className="text-3xl text-white">{githubData?.public_repos}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Followers</h3>
                        <p className="text-3xl text-white">{githubData?.followers}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Following</h3>
                        <p className="text-3xl text-white">{githubData?.following}</p>
                    </div>
                </div>
            </div>

            {/* GitHub README Section */}
            <div className="mt-8 mx-4">
                <h2 className="text-2xl font-semibold text-white mb-4">GitHub README</h2>
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                    <div className="prose prose-invert">
                        {githubData?.readme ? (
                            <div dangerouslySetInnerHTML={{ __html: githubData.readme }} />
                        ) : (
                            <p className="text-gray-400">No README available.</p>
                        )}
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