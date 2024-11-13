import React, { useState } from 'react';

const AdminManagementModal = ({ isOpen, onClose, onAddAdmin }) => {
    const [username, setUsername] = useState('');
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>
  
          <div>
          <label className="block text-gray-300 mb-2">Username</label>
          <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500"
          />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAddAdmin({ username });
                setUsername('');
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Admin
            </button>
          </div>
        </div>
      </div>
    );
  };

export default AdminManagementModal;