import React, { useState } from 'react';
import { X, AlertTriangle, RotateCcw, Archive } from 'lucide-react';

const RestoreVersionModal = ({ isOpen, onClose, version, onRestore, isRestoring = false, className = '' }) => {
  const [confirmationText, setConfirmationText] = useState('');
  if (!isOpen || !version) return null;
  const handleConfirm = async () => {
    if (confirmationText !== 'RESTORE') return;
    await onRestore(version.id);
    onClose();
    setConfirmationText('');
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2 text-amber-600">
            <RotateCcw size={18} />
            <h3 className="text-lg font-semibold">Restore Hierarchy Version</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Warning: This will replace the current organization structure</p>
              <p className="mt-1">All current data will be replaced with the selected version's data.</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Archive size={14} className="text-gray-400" />
              <span className="font-medium">Version v{version.version_number}</span>
              <span className="text-xs text-gray-400">{version.version_type}</span>
            </div>
            <div className="text-sm">{version.name}</div>
            {version.description && <div className="text-xs text-gray-500 mt-1">{version.description}</div>}
            <div className="text-xs text-gray-400 mt-2">Captured: {formatDate(version.effective_from)}</div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono bg-gray-100 px-1">RESTORE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
              placeholder="Type RESTORE"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isRestoring}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmationText !== 'RESTORE' || isRestoring}
            className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw size={14} />
            {isRestoring ? 'Restoring...' : 'Restore Version'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RestoreVersionModal;