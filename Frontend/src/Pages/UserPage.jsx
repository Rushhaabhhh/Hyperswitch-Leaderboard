import { motion } from 'framer-motion';
import { FaPencilAlt } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
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
  const [backgroundImage, setBackgroundImage] = useState(localStorage.getItem('backgroundImage') || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [selectedType, setSelectedType] = useState('all');

  // Sync new username with user data
  useEffect(() => {
    setNewUsername(user.username);
  }, [user]);

  // Handle background image upload
  const handleBackgroundImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);
      localStorage.setItem('backgroundImage', imageUrl);
    }
  };

  // Handle username change
  const handleUsernameChange = () => {
    setUser(prev => ({ ...prev, username: newUsername }));
    setIsEditingName(false);
  };

  // Get status color for contributions
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

  // Filter and sort contributions based on selected type and sort order
  const filteredContributions = dummyContributions
    .filter(contribution => selectedType === 'all' || contribution.type.toLowerCase() === selectedType.toLowerCase())
    .sort((a, b) => {
      return sortOrder === 'date_desc' 
        ? new Date(b.date) - new Date(a.date) 
        : new Date(a.date) - new Date(b.date);
    });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className="bg-black py-4 shadow-md fixed w-full top-0 z-10">
        <div className="container pt-2 flex justify-between items-center">
          <motion.img
            src="https://hyperswitch.io/logos/hyperswitch.svg"
            alt="Hyperswitch Logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
        </div>
      </nav>

      {/* Profile Background Section */}
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

        {/* Profile Avatar and Name */}
        <div className="absolute top-28 left-8 flex flex-col items-center">
          <img
            src={user.githubData.avatar_url}
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
                <button onClick={handleUsernameChange} className="ml-2 text-green-400">Save</button>
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
              <p className="text-gray-400 text-lg">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Stats Section */}
      <div className="mt-64 mx-4">
        <h2 className="text-2xl font-semibold text-white mb-4">GitHub Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Public Repos', 'Followers', 'Following'].map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-2">{stat}</h3>
              <p className="text-3xl text-white">
                {user.githubData[stat.toLowerCase().replace(' ', '_')]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contributions Section */}
      <div className="mt-12 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">My Contributions</h2>
          <div className="flex gap-4">
            {/* Type filter dropdown */}
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

            {/* Sort button */}
            <button
              onClick={() => setSortOrder(prev => prev === 'date_desc' ? 'date_asc' : 'date_desc')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'date_desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Contributions list */}
        <div className="grid gap-4">
          {filteredContributions.map(contribution => (
            <div
              key={contribution.id}
              className="flex items-start justify-between bg-gray-800 p-4 rounded-lg shadow-lg"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{contribution.title}</h3>
                <p className={`text-sm ${getStatusColor(contribution.status)} p-1 inline-block rounded-lg`}>
                  {contribution.status}
                </p>
                <p className="text-sm text-gray-400">Date: {contribution.date}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xl font-semibold text-white">{contribution.points} Points</p>
                <div className="flex gap-2 mt-2">
                  {contribution.labels.map((label, index) => (
                    <Tag key={index} className="bg-gray-700 text-gray-300">{label}</Tag>
                  ))}
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
