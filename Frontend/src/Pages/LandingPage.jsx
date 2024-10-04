import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Link } from 'react-scroll';
import LoginModal from '../Components/LoginModal.jsx';
import background from '../assets/background.png';
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false); 

    return (
        <div>

            {/* Navbar */}
            <nav className="bg-[rgb(40,54,82)] p-4 fixed w-full z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <img src="https://hyperswitch.io/logos/hyperswitch.svg" alt="Hyperswitch Logo" />
                    </div>
                    <div className="space-x-6 mx-auto cursor-pointer">
                        <Link to="home" smooth={true} duration={500} offset={-90} className="text-gray-300 text-xl hover:text-white"> Home </Link>
                        <Link to="features" smooth={true} duration={500} offset={-90} className="text-gray-300 text-xl hover:text-white"> Features </Link>
                        <Link to="leaderboard" smooth={true} duration={500} offset={-90} className="text-gray-300 text-xl hover:text-white"> Leaderboard </Link>
                        <Link to="contact" smooth={true} duration={500} offset={-90} className="text-gray-300 text-xl hover:text-white"> Contact </Link>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-blue-700 text-white px-4 py-1.5 rounded-full font-semibold text-lg flex items-center hover:bg-blue-600"
                    >
                        <LogIn className="mr-2 h-6 w-6 " /> Login
                    </button>
                </div>
            </nav>

            {/* Login Modal */}
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Main Content */}
            <div className="bg-gray-100"> 
                {/* Hero Section */}
                <section id="home" className="relative flex flex-col items-center justify-center h-screen bg-[rgb(40,54,82)] text-white overflow-hidden">
                    <img src={background} alt="background" className="absolute inset-0 ml-auto h-full object-cover bg-blend-overlay opacity-50" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center px-4">
                        <FaGithub className="h-36 w-36 mb-6 animate-bounce" />
                        <h1 className="text-6xl font-extrabold animate-fadeInUp">Welcome to the Leaderboard</h1>
                        <p className="mt-4 text-2xl text-gray-300 animate-fadeInUp">Track and reward top contributors in your community</p>
                        <button className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transform transition duration-300">
                            Get Started
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                        <Link to="features" smooth={true} duration={500} offset={-90}>
                            <button className="text-white bg-blue-700 px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">
                                Discover Features
                            </button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="bg-gray-100 p-6 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">Real-Time Tracking</h3>
                                <p className="text-gray-600">Monitor contributions as they happen in real-time.</p>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">Fair Point Assignment</h3>
                                <p className="text-gray-600">Points are awarded based on issue complexity and importance.</p>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">Community Engagement</h3>
                                <p className="text-gray-600">See how you rank and contribute to the community’s success.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leaderboard Section */} 
                <section id="leaderboard" className="py-20 bg-[rgb(40,54,82)]">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">Leaderboard</h2>
                    <div className="overflow-x-auto">
                    <table className="min-w-full bg-[rgb(30,44,72)] rounded-lg shadow-lg">
                        <thead>
                        <tr className="bg-[rgb(20,34,62)] text-white">
                            <th className="py-3 px-6 text-left text-xl font-semibold">Rank</th>
                            <th className="py-3 px-6 text-left text-xl font-semibold">Username</th>
                            <th className="py-3 px-6 text-left text-xl font-semibold">Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Dummy data for leaderboard */}
                        {[
                            { rank: 1, username: 'JohnDoe', points: 1500 },
                            { rank: 2, username: 'JaneSmith', points: 1350 },
                            { rank: 3, username: 'CoderX', points: 1200 },
                            { rank: 4, username: 'DevMaster', points: 1100 },
                            { rank: 5, username: 'AlphaGeek', points: 1000 },
                        ].map((entry, index) => (
                            <tr key={index} className="border-t border-[rgb(50,64,92)] hover:bg-[rgb(50,64,92)]">
                            <td className="py-4 px-6 text-lg text-white">{entry.rank}</td>
                            <td className="py-4 px-6 text-lg text-white">{entry.username}</td>
                            <td className="py-4 px-6 text-lg text-white">{entry.points}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </section>



                {/* Footer */}
                <section id="contact" className="py-20 bg-gray-800">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-white text-5xl">For any queries or assistance,</span>
                            <span className="text-white text-5xl">reach out to us.</span>
                        </div>

                        <div className="flex space-x-12 mt-4 mr-28 text-2xl ">
                            <a
                                href="mailto:youremail@example.com" 
                                className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-500"
                            >
                                Email us
                            </a>
                            <a
                                href="https://github.com/juspay/hyperswitch" 
                                className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500 flex items-center"
                            >
                                <FaGithub className="mr-2" /> GitHub
                            </a>
                        </div>
                    </div>
                </section>

            <footer className="bg-black text-white py-6">
                <div className="container mx-auto px-4 flex flex-col">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-xl mb-6">About Us</h3>
                            <ul className="space-y-1">
                                <li><a href="https://hyperswitch.io/blog/introduction-about-hyperswitch" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200 text-base">About Hyperswitch</a></li>
                                <li><a href="https://hyperswitch.io/about-juspay" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200 text-base">About Juspay</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-6">Resources</h3>
                            <ul className="space-y-1">
                                <li><a href="https://docs.hyperswitch.io/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200 text-base">Documentation</a></li>
                                <li><a href="https://hyperswitch-io.slack.com/join/shared_invite/zt-2jqxmpsbm-WXUENx022HjNEy~Ark7Orw#/shared-invite/email" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200 text-base">Community</a></li>
                                <li><a href="https://hyperswitch.io/blog" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200 text-base">Blogs</a></li>
                                <li><a href="https://docs.hyperswitch.io/?_gl=1*ya5x7*_ga*MTczODk5MTE0LjE3Mjc2ODU3NTg.*_ga_1X38KQVJ1S*MTcyNzkwMTMyMC41LjEuMTcyNzkwMzQ4OC42MC4wLjA" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200 text-base">FAQs</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mt-6">
                        <div className="flex items-center mb-2">
                            <p className="text-lg">Juspay 2024 | </p>
                            <a href="#" className="text-gray-400 hover:text-gray-200 ml-2">Privacy Policy</a>
                            <span className="text-gray-400 mx-2">|</span>
                            <a href="#" className="text-gray-400 hover:text-gray-200">Terms of Service</a>
                        </div>
                        <div className="flex items-center text-5xl space-x-8 mr-10">
                            <a href="https://www.linkedin.com/company/hyperswitch/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200"><FaLinkedin /></a>
                            <a href="https://x.com/HyperSwitchIO" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200"><FaTwitter /></a>
                            <a href="https://www.youtube.com/@HyperswitchIO" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200"><FaYoutube /></a>
                        </div>
                    </div>
                </div>
            </footer>



            </div>
        </div>
    );
}

export default App;
