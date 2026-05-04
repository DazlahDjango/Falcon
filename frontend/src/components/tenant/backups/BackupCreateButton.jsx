// frontend/src/components/tenant/backups/BackupCreateButton.jsx
import React, { useState } from 'react';
import { BackupCreateModal } from './BackupCreateModal';
import './backups.css';

export const BackupCreateButton = ({ onCreate, isLoading = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = async (data) => {
        await onCreate(data);
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className="backup-create-btn"
            >
                <span>➕</span>
                Create Backup
            </button>

            <BackupCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreate}
                isLoading={isLoading}
            />
        </>
    );
};