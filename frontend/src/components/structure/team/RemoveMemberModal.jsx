import React, { useState } from 'react';
import { X, AlertTriangle, UserMinus } from 'lucide-react';
import EmployeeAvatar from '../common/EmployeeAvatar';

const RemoveMemberModal = ({ isOpen, onClose, team, member, onRemove, isRemoving = false }) => {
  const [confirmationText, setConfirmationText] = useState('');
  if (!isOpen || !member) return null;
  const handleConfirm = async () => {
    if (confirmationText !== 'CONFIRM') return;
    await onRemove(member.user_id);
    onClose();
    setConfirmationText('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 text-red-600">
            <UserMinus size={20} />
            <h3 className="text-lg font-semibold">Remove Team Member</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <div className="text-sm text-red-700">
              This action will remove the member from the team. Their employment record will be updated.
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Member to Remove</label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <EmployeeAvatar user={member} size="md" />
              <div>
                <div className="font-medium">{member.name || member.user_id}</div>
                <div className="text-sm text-gray-500">{member.position_title || 'No position'}</div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono bg-gray-100 px-1">CONFIRM</span> to proceed
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
              placeholder="Type CONFIRM"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isRemoving}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmationText !== 'CONFIRM' || isRemoving}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isRemoving ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RemoveMemberModal;