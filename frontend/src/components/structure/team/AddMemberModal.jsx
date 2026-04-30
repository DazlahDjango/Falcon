import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';

const AddMemberModal = ({ isOpen, onClose, team, availableMembers, onAdd, isAdding = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  if (!isOpen) return null;
  const filteredMembers = availableMembers?.filter(member =>
    member.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleAdd = async () => {
    if (!selectedUserId) return;
    await onAdd(selectedUserId);
    setSelectedUserId('');
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md add-member-modal">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Add Member to {team?.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or position..."
              className="member-search-input pl-9"
            />
          </div>
          <div className="member-list">
            {filteredMembers?.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No available members found</div>
            ) : (
              filteredMembers?.map(member => (
                <div
                  key={member.user_id}
                  onClick={() => setSelectedUserId(member.user_id)}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    selectedUserId === member.user_id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{member.name || member.user_id}</div>
                  <div className="text-xs text-gray-500">{member.position_title || 'No position'}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isAdding}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedUserId || isAdding}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus size={14} />
            {isAdding ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddMemberModal;