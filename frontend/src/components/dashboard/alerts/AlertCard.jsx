import React from 'react';
import PropTypes from 'prop-types';
import { FiBell, FiAlertTriangle, FiInfo, FiClock, FiCheckCircle } from 'react-icons/fi';
import { StatusBadge } from '../common/StatusBadge';

export const AlertCard = ({ alert, onDismiss, onViewDetails, compact = false }) => {
  const severityConfig = {
    critical: { icon: FiAlertTriangle, color: '#ef4444', bg: '#fef2f2' },
    warning: { icon: FiBell, color: '#f59e0b', bg: '#fffbeb' },
    info: { icon: FiInfo, color: '#3b82f6', bg: '#eff6ff' },
    success: { icon: FiCheckCircle, color: '#10b981', bg: '#f0fdf4' }
  };

  const config = severityConfig[alert.severity] || severityConfig.info;
  const Icon = config.icon;

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        background: config.bg,
        borderRadius: '8px',
        borderLeft: `3px solid ${config.color}`
      }}>
        <Icon size={16} color={config.color} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{alert.title || alert.alert_type}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{alert.message}</div>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#94a3b8'
            }}
          >
            <FiClock size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      background: config.bg,
      borderRadius: '12px',
      border: `1px solid ${config.color}20`,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: `${config.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={config.color} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, color: config.color }}>
                {alert.title || alert.alert_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {getRelativeTime(alert.created_at)}
              </div>
            </div>
            <StatusBadge status={alert.severity} size="small" />
          </div>
          
          <div style={{ fontSize: '14px', color: '#334155', marginBottom: '12px' }}>
            {alert.message}
          </div>
          
          {alert.details && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#475569',
              marginBottom: '12px'
            }}>
              {alert.details}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(alert)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                View Details
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: config.color,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AlertCard.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    alert_type: PropTypes.string,
    severity: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.string,
    created_at: PropTypes.string
  }).isRequired,
  onDismiss: PropTypes.func,
  onViewDetails: PropTypes.func,
  compact: PropTypes.bool
};