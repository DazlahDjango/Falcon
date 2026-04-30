import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import DepartmentSelector from './DepartmentSelector';

const DepartmentMoveModal = ({ isOpen, onClose, department, departments, onConfirm, isMoving = false }) => {
  const [selectedParentId, setSelectedParentId] = useState(department?.parent_id || '');
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm(department.id, selectedParentId || null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to move department');
    }
  };
  const availableParents = departments?.filter(d => d.id !== department?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md department-move-modal">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Move Department</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department to Move
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md">
              <span className="font-medium">{department?.name}</span>
              <span className="text-sm text-gray-500 ml-2">({department?.code})</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Parent Department (Optional)
            </label>
            <DepartmentSelector
              value={selectedParentId}
              onChange={setSelectedParentId}
              departments={availableParents}
              placeholder="Root level (no parent)"
            />
          </div>
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <strong>Warning:</strong> Moving this department will also move all its sub-departments and teams.
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isMoving}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isMoving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isMoving ? 'Moving...' : 'Confirm Move'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default DepartmentMoveModal;