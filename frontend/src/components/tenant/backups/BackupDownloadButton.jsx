// frontend/src/components/tenant/backups/BackupDownloadButton.jsx
import React, { useState } from 'react';
import './backups.css';

export const BackupDownloadButton = ({ onDownload, isLoading = false }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleClick = async () => {
        setIsDownloading(true);
        await onDownload();
        setIsDownloading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || isDownloading}
            className="backup-download-btn"
            title="Download Backup"
        >
            {isDownloading ? '⏳' : '⬇️'}
        </button>
    );
};