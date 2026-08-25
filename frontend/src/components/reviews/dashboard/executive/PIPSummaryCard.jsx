// src/components/reviews/dashboard/executive/PIPSummaryCard.jsx
import React from 'react';
import { AlertTriangle, Users, TrendingUp, Clock } from 'lucide-react';

const PIPSummaryCard = ({ summary }) => {
  if (!summary) return null;

  // Normalize by_severity into [ [key, count], ... ]
  let severitiesList = [];
  if (Array.isArray(summary.by_severity)) {
    severitiesList = summary.by_severity.map(item => [
      item.severity || 'unknown',
      typeof item.count === 'number' ? item.count : (typeof item === 'object' ? item.count || 0 : Number(item || 0))
    ]);
  } else if (summary.by_severity && typeof summary.by_severity === 'object') {
    severitiesList = Object.entries(summary.by_severity).map(([key, val]) => [
      key,
      typeof val === 'object' ? val?.count || 0 : Number(val || 0)
    ]);
  }

  return (
    <div className="pip-summary-card">
      <h3 className="pip-summary-card-title">
        <AlertTriangle size={18} />
        PIP Summary
      </h3>
      <div className="pip-summary-card-stats">
        <div className="pip-summary-card-stat">
          <span className="pip-summary-card-value" style={{ color: '#f59e0b' }}>
            {summary.active_pips || 0}
          </span>
          <span className="pip-summary-card-label">Active</span>
        </div>
        <div className="pip-summary-card-stat">
          <span className="pip-summary-card-value" style={{ color: '#22c55e' }}>
            {summary.successful_rate || 0}%
          </span>
          <span className="pip-summary-card-label">Success Rate</span>
        </div>
      </div>
      {severitiesList.length > 0 && (
        <div className="pip-summary-card-severities">
          <span className="pip-summary-card-severities-label">By Severity</span>
          {severitiesList.map(([severity, count]) => (
            <div key={severity} className="pip-summary-card-severity">
              <span className="pip-summary-card-severity-label">{severity}</span>
              <span className="pip-summary-card-severity-count">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PIPSummaryCard;