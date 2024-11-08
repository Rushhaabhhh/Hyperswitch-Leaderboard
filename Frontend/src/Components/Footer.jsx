import React from 'react';
import { FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';


const Footer = () => {
    return (
        <div className="bg-black text-white py-6">
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
        </div>
    );
};

export default Footer;