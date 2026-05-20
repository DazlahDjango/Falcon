import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const RefreshButton = ({ onRefresh, isLoading = false, lastUpdated = null, className = '' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isLoading || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return updated.toLocaleDateString();
  };

  const refreshing = isLoading || isRefreshing;

  return (
    <div className={`refresh-button ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        style={{
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          background: 'white',
          cursor: refreshing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: refreshing ? 0.6 : 1
        }}
      >
        <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
          🔄
        </span>
      </button>
      {lastUpdated && (
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Last updated: {formatLastUpdated(lastUpdated)}
        </span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

RefreshButton.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  lastUpdated: PropTypes.string,
  className: PropTypes.string
};