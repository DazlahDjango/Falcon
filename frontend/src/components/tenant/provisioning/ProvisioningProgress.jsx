// frontend/src/components/tenant/provisioning/ProvisioningProgress.jsx
import React from 'react';
import './provisioning.css';

export const ProvisioningProgress = ({ progress, status, message }) => {
    const getFillClass = () => {
        if (status === 'completed') return 'provisioning-progress-fill provisioning-progress-fill-completed';
        if (status === 'failed') return 'provisioning-progress-fill provisioning-progress-fill-failed';
        return 'provisioning-progress-fill';
    };

    const getStatusLabel = () => {
        if (status === 'completed') return 'Completed';
        if (status === 'failed') return 'Failed';
        if (status === 'provisioning') return 'Provisioning in progress...';
        return 'Waiting to start...';
    };

    return (
        <div className="provisioning-progress-container">
            <div className="provisioning-progress-bar">
                <div
                    className={getFillClass()}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <div className="provisioning-progress-percentage">
                {Math.min(progress, 100)}%
            </div>
            <div className="provisioning-progress-label">
                {message || getStatusLabel()}
            </div>
        </div>
    );
};