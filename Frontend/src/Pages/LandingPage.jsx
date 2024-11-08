import React, { useState, useEffect, useRef, Suspense } from 'react';
import { LogIn, Github } from 'lucide-react';
import { Link } from 'react-scroll';
import LoginModal from '../Components/LoginModal.jsx';
import background from '../assets/background.png';
import image from '../assets/aws.jpg';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaCode, FaStar, FaTrophy, FaUsers } from 'react-icons/fa';
import Leaderboard from '../Components/Leaderboard.jsx';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Footer from '../Components/Footer.jsx';

gsap.registerPlugin(ScrollTrigger);


function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const controls = useAnimation();
  const { scrollYProgress } = useScroll();
  const featuresRef = useRef(null);
  const contributorsRef = useRef(null);

  const features = [
    {
      icon: FaCode,
      title: "Code Contributions",
      description: "Track your impact through lines of code, commits, and meaningful contributions"
    },
    {
      icon: FaCode,
      title: "Pull Requests",
      description: "Monitor your PR success rate and review engagement metrics"
    },
    {
      icon: FaStar,
      title: "Repository Impact",
      description: "See how your contributions affect repository growth and popularity"
    }
  ];

  const contributorStats = [
    { number: '1000+', label: 'Active Contributors', icon: FaUsers },
    { number: '4000+', label: 'Pull Requests Merged', icon: FaCode },
    { number: '12K+', label: 'Stars Earned', icon: FaStar },
    { number: '50+', label: 'Top Contributors', icon: FaTrophy }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate feature cards
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top center',
          end: 'center center',
          scrub: 1,
        },
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
      });

      // Animate contributor stats
      gsap.from('.contributor-stat', {
        scrollTrigger: {
          trigger: contributorsRef.current,
          start: 'top center',
          end: 'center center',
          scrub: 1,
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-gray-100">
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
          <motion.button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-700 text-white px-4 py-1.5 rounded-full font-semibold text-lg flex items-center"
            whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8' }}
            whileTap={{ scale: 0.95 }}
          >
            <LogIn className="mr-2 h-6 w-6" /> Login
          </motion.button>
        </div>
      </nav>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen bg-[rgb(40,54,82)] text-white overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2 }}
        >
          <img src={background} alt="background" className="w-full h-full object-cover" />
        </motion.div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10 py-32">
          <motion.div 
            className="md:w-1/2 text-left"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Celebrate Open Source Heroes
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Track, recognize, and reward the outstanding contributors shaping the future of Hyperswitch.
            </p>
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}  
              onClick={() => document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth' })}            
            >
              View Leaderboard
            </motion.button>
          </motion.div>

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
            <FaGithub className="h-60 w-60 mt-16 mr-10" />
            </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 md:mb-0 text-center">
              Track Your Open Source Journey
            </h2>
            <img src={image} className="h-48 w-48 md:ml-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Contributor Stats Section */}
      <section ref={contributorsRef} className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our Growing Community
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {contributorStats.map((stat, index) => (
              <motion.div
                key={index}
                className="contributor-stat text-center"
                whileHover={{ scale: 1.1 }}
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
                <p className="text-xl text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

                {/*Leaderboard Section */}
                <div id="leaderboard" >
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

                {/* <footer className="bg-black text-white py-6">
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
                </footer> */}

                <Footer />

            </div>
    );
}

export default App;



