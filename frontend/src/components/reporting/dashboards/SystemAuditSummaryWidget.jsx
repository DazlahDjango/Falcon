import React from 'react';

export const SystemAuditSummaryWidget = ({ healthMetrics }) => {
  const activeTenants = healthMetrics?.active_tenants || 12;
  const systemStatus = healthMetrics?.system_status || 'Optimal';

  return (
    <div className="reporting-stat-widget">
      <div className="reporting-stat-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div>
        <div className="reporting-stat-value">{activeTenants} Tenants</div>
        <div className="reporting-stat-label">System Health: {systemStatus}</div>
      </div>
    </div>
  );
};

export default SystemAuditSummaryWidget;
