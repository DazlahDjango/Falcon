// frontend/src/components/tenant/backups/BackupDeleteModal.jsx
import React from 'react';
import './backups.css';

export const BackupDeleteModal = ({ isOpen, onClose, onConfirm, backupDate, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="backup-modal-overlay" onClick={onClose}>
            <div className="backup-modal" onClick={(e) => e.stopPropagation()}>
                <div className="backup-modal-header">
                    <h3 className="backup-modal-title">Delete Backup</h3>
                    <button onClick={onClose} className="backup-modal-close">✕</button>
                </div>

                <div className="backup-modal-body">
                    <p>Are you sure you want to delete the backup created on:</p>
                    <p className="font-semibold mt-1">{backupDate}</p>
                    <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                </div>

                <div className="backup-modal-footer">
                    <button onClick={onClose} className="backup-btn backup-btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="backup-btn backup-btn-danger"
                    >
                        {isLoading ? 'Deleting...' : 'Delete Backup'}
                    </button>
                </div>
            </div>
        </div>
    );
};