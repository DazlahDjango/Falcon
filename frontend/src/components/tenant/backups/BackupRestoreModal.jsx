// frontend/src/components/tenant/backups/BackupRestoreModal.jsx
import React, { useState } from 'react';
import './backups.css';

export const BackupRestoreModal = ({ isOpen, onClose, onConfirm, backup, isLoading = false }) => {
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (confirmText === 'RESTORE') {
            onConfirm();
        }
    };

    return (
        <div className="backup-modal-overlay" onClick={onClose}>
            <div className="backup-modal" onClick={(e) => e.stopPropagation()}>
                <div className="backup-modal-header">
                    <h3 className="backup-modal-title">Restore from Backup</h3>
                    <button onClick={onClose} className="backup-modal-close">✕</button>
                </div>

                <div className="backup-modal-body">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                        <p className="text-sm text-yellow-700">
                            ⚠️ Warning: Restoring will overwrite current data. This action cannot be undone.
                        </p>
                    </div>

                    <p>Are you sure you want to restore from backup created on:</p>
                    <p className="font-semibold mt-1">{backup ? new Date(backup.created_at).toLocaleString() : '-'}</p>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <strong className="text-red-600">RESTORE</strong> to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="backup-form-input"
                            placeholder='Type "RESTORE" to confirm'
                        />
                    </div>
                </div>

                <div className="backup-modal-footer">
                    <button onClick={onClose} className="backup-btn backup-btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || confirmText !== 'RESTORE'}
                        className="backup-btn backup-btn-danger"
                    >
                        {isLoading ? 'Restoring...' : 'Restore Backup'}
                    </button>
                </div>
            </div>
        </div>
    );
};