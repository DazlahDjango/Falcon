// src/components/reviews/reports/pip/PIPSummary.jsx
import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, Users, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const PIPSummary = ({ data }) => {
  if (!data) {
    return (
      <div className="pip-summary-report">
        <h3 className="pip-summary-report-title">PIP Summary</h3>
        <div className="pip-summary-report-empty">
          <p>No PIP data available</p>
        </div>
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
    <div className="pip-summary-report">
      <h3 className="pip-summary-report-title">PIP Summary</h3>

      <div className="pip-summary-report-stats">
        {stats.map((stat, index) => (
          <div key={index} className="pip-summary-report-stat">
            <div className="pip-summary-report-stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="pip-summary-report-stat-content">
              <span className="pip-summary-report-stat-value">{stat.value}</span>
              <span className="pip-summary-report-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pip-summary-report-grid">
        {/* Severity Distribution */}
        {Object.keys(severityData).length > 0 && (
          <div className="pip-summary-report-card">
            <h4 className="pip-summary-report-card-title">
              <AlertTriangle size={16} />
              Severity Distribution
            </h4>
            <div className="pip-summary-report-list">
              {Object.entries(severityData).map(([key, value]) => (
                <div key={key} className="pip-summary-report-item">
                  <div className="pip-summary-report-item-info">
                    <span className="pip-summary-report-item-dot" style={{ backgroundColor: severityColors[key] }} />
                    <span className="pip-summary-report-item-label">{severityLabels[key] || key}</span>
                  </div>
                  <div className="pip-summary-report-item-bar-wrapper">
                    <div className="pip-summary-report-item-bar">
                      <div
                        className="pip-summary-report-item-fill"
                        style={{
                          width: totalSeverity > 0 ? `${(value / totalSeverity) * 100}%` : '0%',
                          backgroundColor: severityColors[key],
                        }}
                      />
                    </div>
                    <span className="pip-summary-report-item-count">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outcome Distribution */}
        {Object.keys(outcomeData).length > 0 && (
          <div className="pip-summary-report-card">
            <h4 className="pip-summary-report-card-title">
              <CheckCircle size={16} />
              Outcome Distribution
            </h4>
            <div className="pip-summary-report-list">
              {Object.entries(outcomeData).map(([key, value]) => (
                <div key={key} className="pip-summary-report-item">
                  <div className="pip-summary-report-item-info">
                    <span className="pip-summary-report-item-dot" style={{ backgroundColor: outcomeColors[key] }} />
                    <span className="pip-summary-report-item-label">{outcomeLabels[key] || key}</span>
                  </div>
                  <div className="pip-summary-report-item-bar-wrapper">
                    <div className="pip-summary-report-item-bar">
                      <div
                        className="pip-summary-report-item-fill"
                        style={{
                          width: totalOutcome > 0 ? `${(value / totalOutcome) * 100}%` : '0%',
                          backgroundColor: outcomeColors[key],
                        }}
                      />
                    </div>
                    <span className="pip-summary-report-item-count">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Department Distribution */}
      {data.by_department && Object.keys(data.by_department).length > 0 && (
        <div className="pip-summary-report-card">
          <h4 className="pip-summary-report-card-title">
            <Users size={16} />
            Department Distribution
          </h4>
          <div className="pip-summary-report-departments">
            {Object.entries(data.by_department)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([name, count], index) => {
                const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];
                return (
                  <div key={name} className="pip-summary-report-department">
                    <div className="pip-summary-report-department-info">
                      <span className="pip-summary-report-department-name">{name || 'Unassigned'}</span>
                      <span className="pip-summary-report-department-count">{count}</span>
                    </div>
                    <div className="pip-summary-report-department-bar">
                      <div
                        className="pip-summary-report-department-fill"
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
    </div>
  );
};

export default PIPSummary;