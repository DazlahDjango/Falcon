import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import { StatusBadge, ScoreGauge } from '../../../components/dashboard/common';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

export const TenantDetailModal = ({ isOpen, onClose, tenant }) => {
  const { refreshTenantSnapshot } = useSuperAdminDashboard();

  if (!isOpen || !tenant) return null;

  const handleRefresh = async () => {
    await refreshTenantSnapshot(tenant.client_id);
  };

  const metrics = [
    { label: 'Total Users', value: tenant.total_users, icon: '👥' },
    { label: 'Active Users', value: tenant.active_users, icon: '🟢' },
    { label: 'Total KPIs', value: tenant.total_kpis, icon: '📊' },
    { label: 'Green KPIs', value: tenant.kpi_green_count, icon: '🟢', color: '#10b981' },
    { label: 'Yellow KPIs', value: tenant.kpi_yellow_count, icon: '🟡', color: '#f59e0b' },
    { label: 'Red KPIs', value: tenant.kpi_red_count, icon: '🔴', color: '#ef4444' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{tenant.client_name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="tenant-status-bar">
            <StatusBadge status={tenant.subscription_status} size="large" />
            <button onClick={handleRefresh} className="refresh-tenant-btn">
              <FiRefreshCw size={14} />
              Refresh Data
            </button>
          </div>
          
          <div className="tenant-metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="tenant-metric">
                <div className="metric-icon">{metric.icon}</div>
                <div className="metric-value" style={{ color: metric.color }}>{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>
          
          <div className="tenant-performance">
            <h3>Performance Score</h3>
            <ScoreGauge score={tenant.health_score} size={120} />
          </div>
          
          <div className="tenant-actions">
            <button className="action-btn primary">View Detailed Report</button>
            <button className="action-btn">Manage Subscription</button>
            <button className="action-btn danger">Suspend Tenant</button>
          </div>
        </div>
      </div>
    </div>
  );
};

TenantDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tenant: PropTypes.object
};