// src/components/reviews/promotions/stats/PromotionAnalytics.jsx
import React from 'react';
import { Building, Users, Award, Clock, TrendingUp } from 'lucide-react';

const PromotionAnalytics = ({ stats }) => {
  if (!stats) return null;

  const departmentData = stats.by_department || {};
  const priorityData = stats.by_priority || {};

  const departmentColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  const priorityLabels = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
    urgent: 'Urgent',
  };

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
    urgent: '#8b5cf6',
  };

  const totalByDepartment = Object.values(departmentData).reduce((sum, val) => sum + val, 0);
  const totalByPriority = Object.values(priorityData).reduce((sum, val) => sum + val, 0);

  return (
    <div className="promotion-analytics">
      <div className="promotion-analytics-grid">
        {/* Department Distribution */}
        {Object.keys(departmentData).length > 0 && (
          <div className="promotion-analytics-card">
            <h3 className="promotion-analytics-card-title">
              <Building size={18} />
              Department Distribution
            </h3>
            <div className="promotion-analytics-list">
              {Object.entries(departmentData)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count], index) => (
                  <div key={name} className="promotion-analytics-item">
                    <div className="promotion-analytics-item-info">
                      <span className="promotion-analytics-item-label">{name || 'Unassigned'}</span>
                      <span className="promotion-analytics-item-count">{count}</span>
                    </div>
                    <div className="promotion-analytics-item-bar">
                      <div
                        className="promotion-analytics-item-fill"
                        style={{
                          width: totalByDepartment > 0 ? `${(count / totalByDepartment) * 100}%` : '0%',
                          backgroundColor: departmentColors[index % departmentColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Priority Distribution */}
        {Object.keys(priorityData).length > 0 && (
          <div className="promotion-analytics-card">
            <h3 className="promotion-analytics-card-title">
              <Award size={18} />
              Priority Distribution
            </h3>
            <div className="promotion-analytics-priority-list">
              {Object.entries(priorityData).map(([key, count]) => (
                <div key={key} className="promotion-analytics-priority-item">
                  <div className="promotion-analytics-priority-info">
                    <span
                      className="promotion-analytics-priority-dot"
                      style={{ backgroundColor: priorityColors[key] }}
                    />
                    <span className="promotion-analytics-priority-label">
                      {priorityLabels[key] || key}
                    </span>
                  </div>
                  <div className="promotion-analytics-priority-bar-wrapper">
                    <div className="promotion-analytics-priority-bar">
                      <div
                        className="promotion-analytics-priority-fill"
                        style={{
                          width: totalByPriority > 0 ? `${(count / totalByPriority) * 100}%` : '0%',
                          backgroundColor: priorityColors[key],
                        }}
                      />
                    </div>
                    <span className="promotion-analytics-priority-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="promotion-analytics-card full">
          <h3 className="promotion-analytics-card-title">
            <TrendingUp size={18} />
            Key Metrics
          </h3>
          <div className="promotion-analytics-metrics">
            <div className="promotion-analytics-metric">
              <span className="promotion-analytics-metric-label">Total Promotions</span>
              <span className="promotion-analytics-metric-value">
                {(stats.total_pending || 0) + (stats.total_approved || 0) + (stats.total_rejected || 0) + (stats.total_completed || 0)}
              </span>
            </div>
            <div className="promotion-analytics-metric">
              <span className="promotion-analytics-metric-label">Approval Rate</span>
              <span className="promotion-analytics-metric-value" style={{ color: '#22c55e' }}>
                {(() => {
                  const total = (stats.total_approved || 0) + (stats.total_rejected || 0);
                  const rate = total > 0 ? ((stats.total_approved || 0) / total) * 100 : 0;
                  return `${rate.toFixed(1)}%`;
                })()}
              </span>
            </div>
            <div className="promotion-analytics-metric">
              <span className="promotion-analytics-metric-label">Avg Timeline</span>
              <span className="promotion-analytics-metric-value" style={{ color: '#06b6d4' }}>
                {stats.average_timeline_days?.toFixed(1) || '—'} days
              </span>
            </div>
            <div className="promotion-analytics-metric">
              <span className="promotion-analytics-metric-label">Pending</span>
              <span className="promotion-analytics-metric-value" style={{ color: '#f59e0b' }}>
                {stats.total_pending || 0}
              </span>
            </div>
            <div className="promotion-analytics-metric">
              <span className="promotion-analytics-metric-label">Completed</span>
              <span className="promotion-analytics-metric-value" style={{ color: '#8b5cf6' }}>
                {stats.total_completed || 0}
              </span>
            </div>
            <div className="promotion-analytics-metric">
              <span className="promotion-analytics-metric-label">Rejected</span>
              <span className="promotion-analytics-metric-value" style={{ color: '#ef4444' }}>
                {stats.total_rejected || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionAnalytics;