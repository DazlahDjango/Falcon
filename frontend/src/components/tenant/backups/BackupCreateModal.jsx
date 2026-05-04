// frontend/src/components/tenant/backups/BackupCreateModal.jsx
import React, { useState } from 'react';
import './backups.css';

export const BackupCreateModal = ({ isOpen, onClose, onCreate, isLoading = false }) => {
    const [backupType, setBackupType] = useState('full');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({ backup_type: backupType });
    };

    return (
        <div className="backup-modal-overlay" onClick={onClose}>
            <div className="backup-modal" onClick={(e) => e.stopPropagation()}>
                <div className="backup-modal-header">
                    <h3 className="backup-modal-title">Create Backup</h3>
                    <button onClick={onClose} className="backup-modal-close">✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="backup-modal-body">
                        <div className="backup-form-group">
                            <label className="backup-form-label">Backup Type</label>
                            <select
                                value={backupType}
                                onChange={(e) => setBackupType(e.target.value)}
                                className="backup-form-select"
                                disabled={isLoading}
                            >
                                <option value="full">Full Backup (Schema + Data)</option>
                                <option value="schema">Schema Only</option>
                                <option value="data">Data Only</option>
                                <option value="incremental">Incremental</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Full backup includes both database schema and all data.
                                Schema only includes structure without data.
                                Data only includes data without structure.
                                Incremental only includes changes since last backup.
                            </p>
                        </div>
                    </div>

                    <div className="backup-modal-footer">
                        <button type="button" onClick={onClose} className="backup-btn backup-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="backup-btn backup-btn-primary">
                            {isLoading ? 'Creating...' : 'Create Backup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};