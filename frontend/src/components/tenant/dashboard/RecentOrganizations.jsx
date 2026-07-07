// components/tenant/dashboard/RecentOrganizations.jsx
import React from 'react';
import { FiArrowRight, FiClock } from 'react-icons/fi';

const RecentOrganizations = ({ organizations, onViewAll, onSelect }) => {
  if (!organizations || organizations.length === 0) {
    return (
      <div className="dashboard-card">
        <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Recent Organizations</h4>
        <p className="dashboard-text-sm dashboard-text-muted">No recent organizations</p>
      </div>
    );
  }

  const getTimeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-flex-between dashboard-mb-4">
        <h4 className="dashboard-font-semibold dashboard-text-sm" style={{ color: '#0f172a' }}>Recent Organizations</h4>
        {onViewAll && (
          <button className="dashboard-btn dashboard-btn-secondary dashboard-btn-sm" onClick={onViewAll}>
            View All <FiArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>
        )}
      </div>
      <div className="dashboard-space-y-2">
        {organizations.slice(0, 5).map((org) => (
          <div
            key={org.id}
            className="dashboard-flex-between"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: onSelect ? 'pointer' : 'default',
              transition: 'background 0.2s',
            }}
            onClick={() => onSelect && onSelect(org.id)}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div>
              <div className="dashboard-font-medium dashboard-text-sm" style={{ color: '#0f172a' }}>{org.name}</div>
              <div className="dashboard-flex dashboard-gap-2">
                <span className="dashboard-text-xs dashboard-text-muted">{org.status}</span>
                {org.is_onboarded && <span className="dashboard-badge dashboard-badge-green" style={{ fontSize: '10px', padding: '1px 8px' }}>Onboarded</span>}
              </div>
            </div>
            <div className="dashboard-flex dashboard-gap-2" style={{ alignItems: 'center' }}>
              <FiClock size={12} style={{ color: '#94a3b8' }} />
              <span className="dashboard-text-xs dashboard-text-muted">{getTimeAgo(org.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
      {organizations.length > 5 && (
        <div className="dashboard-mt-4 dashboard-text-center">
          <span className="dashboard-text-xs dashboard-text-muted">+{organizations.length - 5} more</span>
        </div>
      )}
    </div>
  );
};

export default RecentOrganizations;