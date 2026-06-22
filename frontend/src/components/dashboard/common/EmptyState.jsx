import React from 'react';
import PropTypes from 'prop-types';

export const EmptyState = ({ 
  title = 'No Data Available', 
  message = 'There is no data to display at this time.',
  icon = '📊',
  actionLabel = null,
  onAction = null,
  className = ''
}) => {
  const displayMessage = message instanceof Error 
    ? message.message 
    : (typeof message === 'object' && message !== null 
        ? JSON.stringify(message) 
        : String(message));

  return (
    <div className={`empty-state ${className}`} style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{displayMessage}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.node,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string
};