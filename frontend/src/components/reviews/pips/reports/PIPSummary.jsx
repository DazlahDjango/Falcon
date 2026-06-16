// src/components/reviews/pips/reports/PIPSummary.jsx
import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

const PIPSummary = ({ data }) => {
  if (!data) {
    return (
      <div className="pip-summary-empty">
        <AlertCircle size={48} />
        <h3>No Data Available</h3>
        <p>There are no PIPs to display in the summary.</p>
      </div>
    );
  }

  const stats = [
    {
      icon: <FileText size={20} />,
      label: 'Total PIPs',
      value: data.total_pips || 0,
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      icon: <AlertTriangle size={20} />,
      label: 'Active PIPs',
      value: data.active_pips || 0,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: <Clock size={20} />,
      label: 'Overdue PIPs',
      value: data.overdue_pips || 0,
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    {
      icon: <AlertCircle size={20} />,
      label: 'Ending Soon',
      value: data.ending_soon_pips || 0,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Success Rate',
      value: data.success_rate ? `${data.success_rate}%` : '0%',
      color: '#22c55e',
      bgColor: '#d1fae5',
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Avg Completion Rate',
      value: data.average_completion_rate ? `${data.average_completion_rate}%` : '0%',
      color: '#06b6d4',
      bgColor: '#cffafe',
    },
  ];

  const severityData = data.by_severity || {};
  const severityColors = {
    minor: '#6b7280',
    moderate: '#f59e0b',
    severe: '#ef4444',
    critical: '#dc2626',
  };
  const severityLabels = {
    minor: 'Minor',
    moderate: 'Moderate',
    severe: 'Severe',
    critical: 'Critical',
  };

  const outcomeData = data.by_outcome || {};
  const outcomeColors = {
    successful: '#22c55e',
    extended: '#f59e0b',
    failed: '#ef4444',
    terminated: '#dc2626',
    resigned: '#6b7280',
    pending: '#3b82f6',
  };
  const outcomeLabels = {
    successful: 'Successful',
    extended: 'Extended',
    failed: 'Failed',
    terminated: 'Terminated',
    resigned: 'Resigned',
    pending: 'Pending',
  };

  const totalSeverity = Object.values(severityData).reduce((sum, val) => sum + val, 0);
  const totalOutcome = Object.values(outcomeData).reduce((sum, val) => sum + val, 0);

  return (
    <div className="pip-summary">
      {/* Stats Grid */}
      <div className="pip-summary-stats">
        {stats.map((stat, index) => (
          <div key={index} className="pip-summary-stat">
            <div className="pip-summary-stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="pip-summary-stat-content">
              <span className="pip-summary-stat-value">{stat.value}</span>
              <span className="pip-summary-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pip-summary-grid">
        {/* Severity Distribution */}
        <div className="pip-summary-card">
          <h3 className="pip-summary-card-title">
            <AlertTriangle size={18} />
            Severity Distribution
          </h3>
          {Object.keys(severityData).length === 0 ? (
            <div className="pip-summary-card-empty">No severity data available</div>
          ) : (
            <div className="pip-summary-severity-list">
              {Object.entries(severityData).map(([key, value]) => (
                <div key={key} className="pip-summary-severity-item">
                  <div className="pip-summary-severity-info">
                    <span 
                      className="pip-summary-severity-dot" 
                      style={{ backgroundColor: severityColors[key] }}
                    />
                    <span className="pip-summary-severity-label">
                      {severityLabels[key] || key}
                    </span>
                  </div>
                  <div className="pip-summary-severity-bar-wrapper">
                    <div className="pip-summary-severity-bar">
                      <div
                        className="pip-summary-severity-fill"
                        style={{
                          width: totalSeverity > 0 ? `${(value / totalSeverity) * 100}%` : '0%',
                          backgroundColor: severityColors[key],
                        }}
                      />
                    </div>
                    <span className="pip-summary-severity-count">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Distribution */}
        {data.by_department && Object.keys(data.by_department).length > 0 && (
          <div className="pip-summary-card">
            <h3 className="pip-summary-card-title">
              <Users size={18} />
              Department Distribution
            </h3>
            <div className="pip-summary-department-list">
              {Object.entries(data.by_department)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count], index) => {
                  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];
                  return (
                    <div key={name} className="pip-summary-department-item">
                      <div className="pip-summary-department-info">
                        <span className="pip-summary-department-name">{name || 'Unassigned'}</span>
                        <span className="pip-summary-department-count">{count}</span>
                      </div>
                      <div className="pip-summary-department-bar">
                        <div
                          className="pip-summary-department-fill"
                          style={{
                            width: `${(count / (data.total_pips || 1)) * 100}%`,
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Outcome Distribution */}
        <div className="pip-summary-card">
          <h3 className="pip-summary-card-title">
            <CheckCircle size={18} />
            Outcome Distribution
          </h3>
          {Object.keys(outcomeData).length === 0 ? (
            <div className="pip-summary-card-empty">No outcome data available</div>
          ) : (
            <div className="pip-summary-outcome-list">
              {Object.entries(outcomeData).map(([key, value]) => (
                <div key={key} className="pip-summary-outcome-item">
                  <div className="pip-summary-outcome-info">
                    <span 
                      className="pip-summary-outcome-dot" 
                      style={{ backgroundColor: outcomeColors[key] }}
                    />
                    <span className="pip-summary-outcome-label">
                      {outcomeLabels[key] || key}
                    </span>
                  </div>
                  <div className="pip-summary-outcome-bar-wrapper">
                    <div className="pip-summary-outcome-bar">
                      <div
                        className="pip-summary-outcome-fill"
                        style={{
                          width: totalOutcome > 0 ? `${(value / totalOutcome) * 100}%` : '0%',
                          backgroundColor: outcomeColors[key],
                        }}
                      />
                    </div>
                    <span className="pip-summary-outcome-count">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="pip-summary-metrics">
        <div className="pip-summary-metrics-item">
          <span className="pip-summary-metrics-label">Total PIPs Created</span>
          <span className="pip-summary-metrics-value">{data.total_pips || 0}</span>
        </div>
        <div className="pip-summary-metrics-item">
          <span className="pip-summary-metrics-label">Success Rate</span>
          <span className="pip-summary-metrics-value" style={{ color: data.success_rate >= 70 ? '#22c55e' : '#ef4444' }}>
            {data.success_rate || 0}%
          </span>
        </div>
        <div className="pip-summary-metrics-item">
          <span className="pip-summary-metrics-label">Avg Completion Rate</span>
          <span className="pip-summary-metrics-value" style={{ color: data.average_completion_rate >= 70 ? '#22c55e' : '#f59e0b' }}>
            {data.average_completion_rate || 0}%
          </span>
        </div>
        <div className="pip-summary-metrics-item">
          <span className="pip-summary-metrics-label">Active PIPs</span>
          <span className="pip-summary-metrics-value" style={{ color: data.active_pips > 0 ? '#f59e0b' : '#22c55e' }}>
            {data.active_pips || 0}
          </span>
        </div>
        <div className="pip-summary-metrics-item">
          <span className="pip-summary-metrics-label">Overdue PIPs</span>
          <span className="pip-summary-metrics-value" style={{ color: data.overdue_pips > 0 ? '#ef4444' : '#22c55e' }}>
            {data.overdue_pips || 0}
          </span>
        </div>
        <div className="pip-summary-metrics-item">
          <span className="pip-summary-metrics-label">Ending Soon</span>
          <span className="pip-summary-metrics-value" style={{ color: data.ending_soon_pips > 0 ? '#f59e0b' : '#22c55e' }}>
            {data.ending_soon_pips || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PIPSummary;