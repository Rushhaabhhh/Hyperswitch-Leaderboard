import { React, useState } from "react";

const PointsUpdateModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [reason, setReason] = useState('');
  
    const pointCategories = [
      { label: 'Bug Fix', value: 10 },
      { label: 'Feature Implementation', value: 20 },
      { label: 'Documentation', value: 5 },
      { label: 'Code Review', value: 3 },
      { label: 'Testing', value: 8 }
    ];
  
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
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onUpdate(user.username, pointsToAdd, reason);
                setPointsToAdd(0);
                setReason('');
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Update Points
            </button>
          </div>
        </div>
      </div>
    );
  };
  
export default PointsUpdateModal;