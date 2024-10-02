import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';

const LoginModal = ({ isOpen, onClose }) => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(emailOrUsername, password);
        // Implement your login logic here
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-lg p-6 w-1/3 relative">
                <h2 className="mb-4 text-white">Login using your GitHub account to continue</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-red-800 hover:text-red-600">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <FaGithub className="absolute left-2 top-2 h-6 w-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Username or Email"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            required
                            className="w-full p-2 pl-10 rounded-xl bg-gray-700 text-white"
                        />
                    </div>
                    
                    {errorMessage && (
                        <p className="text-red-500 text-center">{errorMessage}</p> 
                    )}

                    <button type="submit" className="w-full bg-gray-900 p-2 rounded-xl text-white">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
