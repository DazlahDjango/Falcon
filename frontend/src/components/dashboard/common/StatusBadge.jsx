import React from 'react';
import PropTypes from 'prop-types';

const STATUS_CONFIG = {
  green: { label: 'On Track', color: '#10b981', bgColor: '#d1fae5' },
  yellow: { label: 'At Risk', color: '#f59e0b', bgColor: '#fed7aa' },
  red: { label: 'Off Track', color: '#ef4444', bgColor: '#fee2e2' },
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fed7aa' },
  approved: { label: 'Approved', color: '#10b981', bgColor: '#d1fae5' },
  rejected: { label: 'Rejected', color: '#ef4444', bgColor: '#fee2e2' },
  active: { label: 'Active', color: '#10b981', bgColor: '#d1fae5' },
  inactive: { label: 'Inactive', color: '#6b7280', bgColor: '#f3f4f6' },
  critical: { label: 'Critical', color: '#ef4444', bgColor: '#fee2e2' },
  warning: { label: 'Warning', color: '#f59e0b', bgColor: '#fed7aa' },
  info: { label: 'Info', color: '#3b82f6', bgColor: '#dbeafe' }
};

export const StatusBadge = ({ status, text, className = '', size = 'medium' }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.info;
  const displayText = text || config.label;
  
  const sizeStyles = {
    small: { padding: '2px 8px', fontSize: '11px' },
    medium: { padding: '4px 12px', fontSize: '13px' },
    large: { padding: '6px 16px', fontSize: '14px' }
  };

  return (
    <span 
      className={`status-badge status-badge--${status} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        fontWeight: 500,
        ...sizeStyles[size],
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      <span className="status-badge__dot" style={{
        width: size === 'small' ? 6 : 8,
        height: size === 'small' ? 6 : 8,
        borderRadius: '50%',
        backgroundColor: config.color,
        marginRight: '6px'
      }} />
      {displayText}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['green', 'yellow', 'red', 'pending', 'approved', 'rejected', 'active', 'inactive', 'critical', 'warning', 'info']).isRequired,
  text: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};