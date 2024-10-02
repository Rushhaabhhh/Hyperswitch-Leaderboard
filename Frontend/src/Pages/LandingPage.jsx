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
                <section id="home" className="flex flex-col items-center justify-center h-screen bg-[rgb(40,54,82)] text-white relative">
                    <img src={background} alt="background" className="absolute inset-0 ml-auto h-full object-cover bg-blend-overlay opacity-40" />
                    <FaGithub className="h-36 w-36 relative z-10 mb-6" />

                    <h1 className="text-5xl font-extrabold relative z-10">Welcome to the Leaderboard</h1>
                    <p className="mt-4 text-xl relative z-10">Track and reward top contributors in your community</p>
                    <button className="mt-6 bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 relative z-10">
                        Get Started
                    </button>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-bold mb-4">Real-Time Tracking</h3>
                                <p className="text-gray-600">Monitor contributions as they happen in real-time.</p>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-bold mb-4">Fair Point Assignment</h3>
                                <p className="text-gray-600">Points are awarded based on issue complexity and importance.</p>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-bold mb-4">Community Engagement</h3>
                                <p className="text-gray-600">See how you rank and contribute to the community’s success.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leaderboard Section */}
                <section id="leaderboard" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12">Leaderboard</h2>
                        <p className="text-center text-gray-600">Coming soon...</p>
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
