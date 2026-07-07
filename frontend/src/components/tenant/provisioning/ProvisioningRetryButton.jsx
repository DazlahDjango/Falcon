import React, { useState } from 'react';

export const ProvisioningRetryButton = ({ onRetry, isLoading = false, disabled = false }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const loading = isLoading || isRetrying;

  const handleClick = async () => {
    setIsRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className="org-btn org-btn-primary"
    >
      {loading ? 'Retrying...' : 'Retry Provisioning'}
    </button>
  );
};
