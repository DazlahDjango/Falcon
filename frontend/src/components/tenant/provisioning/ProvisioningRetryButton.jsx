// frontend/src/components/tenant/provisioning/ProvisioningRetryButton.jsx
import React, { useState } from 'react';
import './provisioning.css';

export const ProvisioningRetryButton = ({ onRetry, isLoading = false, disabled = false }) => {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleClick = async () => {
        setIsRetrying(true);
        await onRetry();
        setIsRetrying(false);
    };

    const loading = isLoading || isRetrying;

    return (
        <button
            onClick={handleClick}
            disabled={loading || disabled}
            className="provisioning-btn provisioning-btn-primary"
        >
            {loading ? '⟳ Retrying...' : '⟳ Retry Provisioning'}
        </button>
    );
};