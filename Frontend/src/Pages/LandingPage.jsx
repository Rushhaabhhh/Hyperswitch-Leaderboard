import React, { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { Link } from 'react-scroll';
import LoginModal from '../Components/LoginModal.jsx';
import background from '../assets/background.png';
import { motion, useAnimation } from 'framer-motion'; 
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaChartLine, FaRobot, FaUserFriends } from 'react-icons/fa';
import Leaderboard from '../Components/Leaderboard.jsx';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
        controls.start(i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.3 }
        }));
    }, [controls]);

    const featureIcons = [FaChartLine, FaRobot, FaUserFriends];

    return (
        <div>
            {/* Navbar */}
            <nav className="bg-[rgb(40,54,82)] p-4 fixed w-full z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <img src="https://hyperswitch.io/logos/hyperswitch.svg" alt="Hyperswitch Logo" />
                    </div>
                    <div className="space-x-6 mx-auto cursor-pointer">
                        {['home', 'features', 'leaderboard', 'contact'].map((section) => (
                            <Link key={section} to={section} smooth={true} duration={500} offset={-90} className="text-gray-300 text-xl hover:text-white">
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                            </Link>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-blue-700 text-white px-4 py-1.5 rounded-full font-semibold text-lg flex items-center hover:bg-blue-800 hover:scale-105 transform transition-transform duration-300" 
                    >
                        <LogIn className="mr-2 h-6 w-6" /> Login
                    </button>
                </div>
            </nav>

            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Main Content */}
            <div className="bg-gray-100">

                {/* Hero Section */}
                <section id="home" className="relative flex flex-col items-center justify-center h-screen bg-[rgb(40,54,82)] text-white overflow-hidden">
                    <motion.img 
                        src={background} 
                        alt="background" 
                        className="absolute inset-0 ml-auto h-full object-cover bg-blend-overlay opacity-50"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.div 
                        className="relative z-10 flex flex-col items-center text-center px-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    >
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "linear"
                            }}
                        >
                            <FaGithub className="h-36 w-36 mb-6" />
                        </motion.div>
                        <motion.h1
                            className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            Track the Future
                        </motion.h1>
                        <motion.p 
                            className="mt-4 text-3xl text-gray-300"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            Stay ahead with real-time rankings & insights
                        </motion.p>
                        <a href="https://github.com/juspay/hyperswitch" target="_blank" rel="noopener noreferrer">
                            <motion.button
                                className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-xl hover:shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Started
                            </motion.button>
                        </a>
                    </motion.div>

                    <motion.div 
                        className="absolute bottom-10 w-60 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                    />
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 bg-white">
                    <div className="container mx-auto px-4">
                        <motion.h2 
                            className="text-5xl font-bold text-center mb-16 text-gray-800"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            Cutting-Edge Features
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            {[
                                { 
                                    title: 'Real-Time Insights', 
                                    description: 'Get instant updates on community activity with our advanced real-time tracking system. Stay informed about every contribution as it happens.',
                                    icon: FaChartLine
                                },
                                { 
                                    title: 'AI-Powered Ranking', 
                                    description: 'Our sophisticated AI algorithm assigns points based on contribution complexity, ensuring fair and accurate recognition of developer efforts.',
                                    icon: FaRobot
                                },
                                { 
                                    title: 'Seamless Integration', 
                                    description: 'Effortlessly connect with popular platforms and enjoy a smooth, intuitive interface designed for developers of all levels.',
                                    icon: FaUserFriends
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-gradient-to-br from-[rgb(30,44,72)] to-[rgb(40,54,82)] p-8 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 group"
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={controls}
                                    custom={index}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <motion.div
                                        className="text-6xl text-blue-400 mb-6 group-hover:text-purple-400 transition-colors duration-300"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <feature.icon />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold mb-4 text-white">{feature.title}</h3>
                                    <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/*Leaderboard Section */}
                <div id="features">
                    <Leaderboard owner="juspay" repo="hyperswitch" />
                </div>

                {/* Footer */}
                <section id="contact" className="py-20 bg-gray-800">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-white text-5xl">For any queries or assistance,</span>
                            <span className="text-white text-5xl">reach out to us.</span>
                        </div>
                        <div className="flex space-x-12 mt-4 mr-28 text-2xl">
                            <a href="mailto:youremail@example.com" className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-500">
                                Email us
                            </a>
                            <a href="https://github.com/juspay/hyperswitch" className="bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-500 flex items-center">
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
                                    <li>
                                        <a 
                                            href="https://hyperswitch.io/blog/introduction-about-hyperswitch" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200 text-base"
                                        >
                                            About Hyperswitch
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            href="https://hyperswitch.io/about-juspay" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200 text-base"
                                        >
                                            About Juspay
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-6">Resources</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <a 
                                            href="https://docs.hyperswitch.io/" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200 text-base"
                                        >
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            href="https://hyperswitch-io.slack.com/join/shared_invite/zt-2huqq0iq-0fRVyyl8UDlZX5SyK5sYhA#/shared-invite/email" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200 text-base"
                                        >
                                            Slack Community
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 md:col-span-1 md:col-start-4">
                                <h3 className="font-bold text-4xl mb-6">Follow us</h3>
                                <ul className="flex space-x-6">
                                    <li>
                                        <a 
                                            href="https://twitter.com/juspay" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200"
                                        >
                                            <FaTwitter className="h-10 w-10" />
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            href="https://www.linkedin.com/company/juspay/" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200"
                                        >
                                            <FaLinkedin className="h-10 w-10" />
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            href="https://www.youtube.com/@Juspay" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-gray-200"
                                        >
                                            <FaYoutube className="h-10 w-10" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-base">
                                © {new Date().getFullYear()} Hyperswitch. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}

export default App;



