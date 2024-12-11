import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify"; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PointsUpdateModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [reason, setReason] = useState('');
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
  
    const pointCategories = [
        { label: 'Bug Fix', value: 10, type: 'critical-bug' },
        { label: 'Feature Implementation', value: 20, type: 'feature' },
        { label: 'Documentation', value: 5, type: 'enhancement' },
        { label: 'Code Review', value: 3, type: 'enhancement' },
        { label: 'Testing', value: 8, type: 'performance' }
    ];
  
    const handleUpdatePoints = async () => {
        if (!user || !user.username) {
            toast.error("Invalid user selected");
            return;
        }

        if (pointsToAdd <= 0) {
            toast.warn("Please select a valid number of points");
            return;
        }

        setIsLoading(true);

        try {
            // Find the selected category to pass as contribution details
            const selectedCategory = pointCategories.find(
                category => category.value === pointsToAdd
            );

            try {
                const response = await axios.patch(`${API_BASE_URL}/leaderboard/points/${user.username}`, {
                    pointsToAdd,
                    reason: reason || selectedCategory?.label || 'Manual Points Update',
                    contributionDetails: {
                        contributionType: selectedCategory?.type || 'manual',
                        pointCategory: selectedCategory?.label
                    }
                });
        
                toast.success(`Successfully added ${pointsToAdd} points to ${user.username}`);
        
                // Pass the new total points from the backend response
                onUpdate(user.username, pointsToAdd, response.data.newPoints);
        
                setPointsToAdd(0);
                setReason('');
                onClose();
            } catch (error) {
                console.error('Points update error:', error);
                toast.error(
                    error.response?.data?.error || 
                    'Failed to update points. Please try again.'
                );
            }
        }
        catch (error) {
            console.error('Points update error:', error);
            toast.error(
                error.response?.data?.error || 
                'Failed to update points. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };
    
  
    if (!isOpen) return null;
  
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">
                    Update Points for {user?.username}
                </h2>
  
                <div className="space-y-4 mb-6">
                    {pointCategories.map((category) => (
                        <button
                            key={category.label}
                            onClick={() => setPointsToAdd(category.value)}
                            className={`w-full p-3 rounded-lg border transition-colors ${
                                pointsToAdd === category.value
                                    ? 'border-blue-500 bg-blue-500/20 text-white'
                                    : 'border-gray-700 hover:border-blue-500 text-gray-300'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span>{category.label}</span>
                                <span className="font-semibold">+{category.value} points</span>
                            </div>
                        </button>
                    ))}
                </div>
  
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Custom Points</label>
                    <input
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(Number(e.target.value))}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500"
                        min="0"
                    />
                </div>
  
                <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Reason</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded p-2 h-24 focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the contribution..."
                    />
                </div>
  
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-gray-300"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdatePoints}
                        className={`px-4 py-2 text-white rounded transition-colors ${
                            isLoading 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update Points'}
                    </button>
                </div>
            </div>
        </div>
    );
};
  
export default PointsUpdateModal;