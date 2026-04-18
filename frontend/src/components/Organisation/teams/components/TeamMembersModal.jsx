import React, { useState } from 'react';

const TeamMembersModal = ({ team, members, onAddMember, onRemoveMember, onClose, loading }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);

  // In production, fetch available users from API
  // For now, this is a placeholder

  const handleAddMember = () => {
    if (selectedUser) {
      onAddMember(selectedUser);
      setSelectedUser('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Team Members: {team?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Add Member Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Team Member
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a user</option>
                {/* Users will be populated from API */}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Current Members ({members?.length || 0})
            </h3>
            {members?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No members yet</p>
            ) : (
              <div className="space-y-2">
                {members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersModal;