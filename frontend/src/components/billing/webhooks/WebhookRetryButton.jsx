import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const WebhookRetryButton = ({ webhookId, onRetry, size = 'medium' }) => {
    const [loading, setLoading] = useState(false);

    const handleRetry = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            await onRetry(webhookId);
        } finally {
            setLoading(false);
        }
    };

    const sizes = {
        small: 'retry-btn-small',
        medium: 'retry-btn-medium',
        large: 'retry-btn-large',
    };

    return (
        <button
            className={`retry-btn ${sizes[size]} ${loading ? 'loading' : ''}`}
            onClick={handleRetry}
            disabled={loading}
        >
            {loading ? (
                <span className="retry-spinner"></span>
            ) : (
                <>
                    <span className="retry-icon">{renderBillingIcon('renewal', { size: 16 })}</span>
                    <span>Retry</span>
                </>
            )}
        </button>
    );
};

WebhookRetryButton.propTypes = {
    webhookId: PropTypes.string.isRequired,
    onRetry: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default WebhookRetryButton;