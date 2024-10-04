import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const LoginModal = ({ isOpen, onClose }) => {
    const [errorMessage, setErrorMessage] = useState('');

    const handleGitHubLogin = () => {
        window.location.href = 'http://localhost:5000/auth/github'; 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg relative shadow-lg transform transition-transform duration-300 scale-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white transition-colors duration-200">
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <h2 className="mb-6 text-2xl text-white text-center font-semibold">Login with GitHub to Continue</h2>
                
                <div className="text-center space-y-6">
                    <button
                        onClick={handleGitHubLogin}
                        className="bg-gradient-to-r from-gray-900 to-gray-950 p-3 w-full rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-2xl transform transition-transform duration-300 hover:scale-105"
                    >
                        <FaGithub className="mr-3 h-6 w-6" />
                        <span className="font-semibold text-lg">Login with GitHub</span>
                    </button>

                    {errorMessage && (
                        <p className="text-red-500 text-sm text-center mt-4">{errorMessage}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
