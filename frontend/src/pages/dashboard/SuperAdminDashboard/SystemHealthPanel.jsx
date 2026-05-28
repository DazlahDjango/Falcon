import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, StatusBadge, LoadingSkeleton } from '../../../components/dashboard/common';

export const SystemHealthPanel = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="System Health">
        <div className="empty-state">No health data available</div>
      </DashboardCard>
    );
  }

  const services = [
    { name: 'API Service', status: data.api_status, icon: '🔌' },
    { name: 'Database', status: data.database_status, icon: '🗄️' },
    { name: 'Cache Service', status: data.cache_status, icon: '⚡' },
    { name: 'WebSocket', status: data.websocket_status || 'operational', icon: '📡' }
  ];

  return (
    <DashboardCard title="System Health">
      <div className="system-health">
        <div className="uptime">
          <div className="uptime-value">{data.uptime_percentage || 99.95}%</div>
          <div className="uptime-label">Uptime (30 days)</div>
        </div>

        <div className="services-list">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <span className="service-icon">{service.icon}</span>
              <span className="service-name">{service.name}</span>
              <StatusBadge
                status={service.status === 'operational' ? 'active' : 'inactive'}
                text={service.status}
                size="small"
              />
            </div>
          ))}
        </div>

        {data.last_incident && (
          <div className="last-incident">
            <span>⚠️ Last incident: {data.last_incident}</span>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

SystemHealthPanel.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};
export default SystemHealthPanel;