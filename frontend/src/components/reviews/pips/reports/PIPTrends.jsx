// src/components/reviews/pips/reports/PIPTrends.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PIPTrends = ({ data = [] }) => {
  const [expandedMonths, setExpandedMonths] = useState(6);
  const [viewMode, setViewMode] = useState('chart');

  if (!data || data.length === 0) {
    return (
      <div className="pip-trends-empty">
        <TrendingUp size={48} />
        <h3>No Trend Data Available</h3>
        <p>There is not enough data to display trends.</p>
      </div>
    );
  }

  const displayData = data.slice(0, expandedMonths);
  const maxCreated = Math.max(...displayData.map(d => d.created || 0), 1);
  const maxCompleted = Math.max(...displayData.map(d => d.completed || 0), 1);
  const maxValue = Math.max(maxCreated, maxCompleted);

  const getTrendIcon = (index) => {
    if (index === 0) return <Minus size={16} color="#6b7280" />;
    const current = displayData[index];
    const previous = displayData[index - 1];
    const diff = (current.created || 0) - (previous.created || 0);
    if (diff > 0) return <TrendingUp size={16} color="#22c55e" />;
    if (diff < 0) return <TrendingDown size={16} color="#ef4444" />;
    return <Minus size={16} color="#6b7280" />;
  };

  const getDiffColor = (diff) => {
    if (diff > 0) return '#22c55e';
    if (diff < 0) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="pip-trends">
      <div className="pip-trends-header">
        <h3 className="pip-trends-title">PIP Trends</h3>
        <div className="pip-trends-controls">
          <select
            className="pip-trends-select"
            value={expandedMonths}
            onChange={(e) => setExpandedMonths(Number(e.target.value))}
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={data.length}>All Time</option>
          </select>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="pip-trends-chart">
        <div className="pip-trends-chart-header">
          <span className="pip-trends-chart-label">Monthly PIP Activity</span>
          <div className="pip-trends-chart-legend">
            <span className="pip-trends-legend-item">
              <span className="pip-trends-legend-color created" />
              Created
            </span>
            <span className="pip-trends-legend-item">
              <span className="pip-trends-legend-color completed" />
              Completed
            </span>
            <span className="pip-trends-legend-item">
              <span className="pip-trends-legend-color successful" />
              Successful
            </span>
          </div>
        </div>

        <div className="pip-trends-chart-body">
          {displayData.map((item, index) => {
            const createdHeight = maxValue > 0 ? ((item.created || 0) / maxValue) * 100 : 0;
            const completedHeight = maxValue > 0 ? ((item.completed || 0) / maxValue) * 100 : 0;
            const successfulHeight = maxValue > 0 ? ((item.successful || 0) / maxValue) * 100 : 0;

            return (
              <div key={index} className="pip-trends-chart-bar-group">
                <div className="pip-trends-chart-bar-wrapper">
                  <div className="pip-trends-chart-bar-container">
                    {successfulHeight > 0 && (
                      <div 
                        className="pip-trends-chart-bar successful" 
                        style={{ height: `${successfulHeight}%` }}
                      />
                    )}
                    {completedHeight > 0 && (
                      <div 
                        className="pip-trends-chart-bar completed" 
                        style={{ height: `${completedHeight}%` }}
                      />
                    )}
                    {createdHeight > 0 && (
                      <div 
                        className="pip-trends-chart-bar created" 
                        style={{ height: `${createdHeight}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="pip-trends-chart-label">{item.month}</div>
                <div className="pip-trends-chart-trend">{getTrendIcon(index)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="pip-trends-table-container">
        <table className="pip-trends-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Created</th>
              <th>Completed</th>
              <th>Successful</th>
              <th>Failed</th>
              <th>Success Rate</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => {
              const totalCompleted = (item.completed || 0);
              const successRate = totalCompleted > 0 
                ? ((item.successful || 0) / totalCompleted) * 100 
                : 0;
              const prevCompleted = index > 0 ? (displayData[index - 1].completed || 0) : 0;
              const diff = (item.completed || 0) - prevCompleted;

              return (
                <tr key={index} className="pip-trends-table-row">
                  <td className="pip-trends-table-month">{item.month}</td>
                  <td className="pip-trends-table-created">{item.created || 0}</td>
                  <td className="pip-trends-table-completed">{item.completed || 0}</td>
                  <td className="pip-trends-table-successful">
                    <span className="pip-trends-table-badge success">
                      {item.successful || 0}
                    </span>
                  </td>
                  <td className="pip-trends-table-failed">
                    <span className="pip-trends-table-badge failed">
                      {item.failed || 0}
                    </span>
                  </td>
                  <td className="pip-trends-table-rate">
                    <span 
                      className="pip-trends-table-rate-value"
                      style={{ color: successRate >= 70 ? '#22c55e' : successRate >= 40 ? '#f59e0b' : '#ef4444' }}
                    >
                      {successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="pip-trends-table-trend">
                    <span style={{ color: getDiffColor(diff) }}>
                      {diff > 0 ? `+${diff}` : diff < 0 ? diff : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="pip-trends-summary">
        <div className="pip-trends-summary-item">
          <span className="pip-trends-summary-label">Total Created</span>
          <span className="pip-trends-summary-value">
            {displayData.reduce((sum, d) => sum + (d.created || 0), 0)}
          </span>
        </div>
        <div className="pip-trends-summary-item">
          <span className="pip-trends-summary-label">Total Completed</span>
          <span className="pip-trends-summary-value">
            {displayData.reduce((sum, d) => sum + (d.completed || 0), 0)}
          </span>
        </div>
        <div className="pip-trends-summary-item">
          <span className="pip-trends-summary-label">Total Successful</span>
          <span className="pip-trends-summary-value" style={{ color: '#22c55e' }}>
            {displayData.reduce((sum, d) => sum + (d.successful || 0), 0)}
          </span>
        </div>
        <div className="pip-trends-summary-item">
          <span className="pip-trends-summary-label">Total Failed</span>
          <span className="pip-trends-summary-value" style={{ color: '#ef4444' }}>
            {displayData.reduce((sum, d) => sum + (d.failed || 0), 0)}
          </span>
        </div>
        <div className="pip-trends-summary-item">
          <span className="pip-trends-summary-label">Overall Success Rate</span>
          <span 
            className="pip-trends-summary-value"
            style={{ 
              color: (() => {
                const totalCompleted = displayData.reduce((sum, d) => sum + (d.completed || 0), 0);
                const totalSuccessful = displayData.reduce((sum, d) => sum + (d.successful || 0), 0);
                const rate = totalCompleted > 0 ? (totalSuccessful / totalCompleted) * 100 : 0;
                return rate >= 70 ? '#22c55e' : rate >= 40 ? '#f59e0b' : '#ef4444';
              })()
            }}
          >
            {(() => {
              const totalCompleted = displayData.reduce((sum, d) => sum + (d.completed || 0), 0);
              const totalSuccessful = displayData.reduce((sum, d) => sum + (d.successful || 0), 0);
              const rate = totalCompleted > 0 ? (totalSuccessful / totalCompleted) * 100 : 0;
              return `${rate.toFixed(1)}%`;
            })()}
          </span>
        </div>
        <div className="pip-trends-summary-item">
          <span className="pip-trends-summary-label">Avg Monthly Created</span>
          <span className="pip-trends-summary-value">
            {displayData.length > 0 
              ? (displayData.reduce((sum, d) => sum + (d.created || 0), 0) / displayData.length).toFixed(1)
              : '0'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default PIPTrends;