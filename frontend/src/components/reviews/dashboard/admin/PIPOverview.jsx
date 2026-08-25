// src/components/reviews/dashboard/admin/PIPOverview.jsx
import React from 'react';
import { AlertTriangle, Users, TrendingUp, Clock } from 'lucide-react';

const PIPOverview = ({ overview }) => {
  if (!overview) return null;

  // Normalize by_severity into [ [key, count], ... ]
  let severitiesList = [];
  if (Array.isArray(overview.by_severity)) {
    severitiesList = overview.by_severity.map(item => [
      item.severity || 'unknown',
      typeof item.count === 'number' ? item.count : (typeof item === 'object' ? item.count || 0 : Number(item || 0))
    ]);
  } else if (overview.by_severity && typeof overview.by_severity === 'object') {
    severitiesList = Object.entries(overview.by_severity).map(([key, val]) => [
      key,
      typeof val === 'object' ? val?.count || 0 : Number(val || 0)
    ]);
  }

  return (
    <div className="pip-overview">
      <h3 className="pip-overview-title">
        <AlertTriangle size={18} />
        PIP Oversight
      </h3>
      <div className="pip-overview-stats">
        <div className="pip-overview-stat">
          <span className="pip-overview-value" style={{ color: '#f59e0b' }}>
            {overview.active_pips || 0}
          </span>
          <span className="pip-overview-label">Active</span>
        </div>
        <div className="pip-overview-stat">
          <span className="pip-overview-value" style={{ color: '#22c55e' }}>
            {overview.success_rate || 0}%
          </span>
          <span className="pip-overview-label">Success Rate</span>
        </div>
        <div className="pip-overview-stat">
          <span className="pip-overview-value" style={{ color: '#3b82f6' }}>
            {overview.total_pips || 0}
          </span>
          <span className="pip-overview-label">Total</span>
        </div>
      </div>
      {severitiesList.length > 0 && (
        <div className="pip-overview-severities">
          <span className="pip-overview-severities-label">By Severity</span>
          {severitiesList.map(([severity, count]) => (
            <div key={severity} className="pip-overview-severity">
              <span className="pip-overview-severity-label">{severity}</span>
              <span className="pip-overview-severity-count">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PIPOverview;