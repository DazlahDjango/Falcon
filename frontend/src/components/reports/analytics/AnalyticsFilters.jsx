// frontend/src/components/reports/analytics/AnalyticsFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import './analytics.css';

export const AnalyticsFilters = ({
  filters = {},
  reports = [],
  selectedReport = '',
  onFilterChange,
  onReportChange,
  onAnalyze,
  tab = 'trend',
  loading = false,
  className = '',
}) => {
  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const metrics = [
    { value: 'progress', label: 'Progress' },
    { value: 'score', label: 'Score' },
    { value: 'value', label: 'Value' },
    { value: 'growth', label: 'Growth Rate' },
  ];

  const compareOptions = [
    { value: 'department', label: 'Department' },
    { value: 'team', label: 'Team' },
    { value: 'category', label: 'Category' },
    { value: 'period', label: 'Period' },
  ];

  const predictionTypes = [
    { value: 'linear', label: 'Linear' },
    { value: 'moving_average', label: 'Moving Average' },
    { value: 'exponential', label: 'Exponential' },
    { value: 'holt_winters', label: 'Holt-Winters' },
  ];

  const detectionTypes = [
    { value: 'zscore', label: 'Z-Score' },
    { value: 'iqr', label: 'IQR' },
    { value: 'trend', label: 'Trend Anomaly' },
    { value: 'sudden_change', label: 'Sudden Change' },
  ];

  const renderTabFilters = () => {
    switch (tab) {
      case 'trend':
        return (
          <>
            <div className="filter-group">
              <label className="filter-label">Metric</label>
              <select
                className="filter-select"
                value={filters.metric || 'progress'}
                onChange={(e) => onFilterChange('metric', e.target.value)}
              >
                {metrics.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Compare By</label>
              <select
                className="filter-select"
                value={filters.compare_by || 'department'}
                onChange={(e) => onFilterChange('compare_by', e.target.value)}
              >
                {compareOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case 'performance':
        return (
          <>
            <div className="filter-group">
              <label className="filter-label">Metric</label>
              <select
                className="filter-select"
                value={filters.metric || 'progress'}
                onChange={(e) => onFilterChange('metric', e.target.value)}
              >
                {metrics.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Group By</label>
              <select
                className="filter-select"
                value={filters.group_by || 'department'}
                onChange={(e) => onFilterChange('group_by', e.target.value)}
              >
                {compareOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case 'comparative':
        return (
          <>
            <div className="filter-group">
              <label className="filter-label">Compare Type</label>
              <select
                className="filter-select"
                value={filters.compare_by || 'department'}
                onChange={(e) => onFilterChange('compare_by', e.target.value)}
              >
                {compareOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Metric</label>
              <select
                className="filter-select"
                value={filters.metric || 'progress'}
                onChange={(e) => onFilterChange('metric', e.target.value)}
              >
                {metrics.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case 'predictive':
        return (
          <>
            <div className="filter-group">
              <label className="filter-label">Method</label>
              <select
                className="filter-select"
                value={filters.prediction_type || 'linear'}
                onChange={(e) => onFilterChange('prediction_type', e.target.value)}
              >
                {predictionTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Periods Ahead</label>
              <input
                className="filter-input"
                type="number"
                value={filters.periods_ahead || 3}
                onChange={(e) => onFilterChange('periods_ahead', parseInt(e.target.value) || 3)}
                min="1"
                max="12"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Confidence</label>
              <select
                className="filter-select"
                value={filters.confidence || 0.95}
                onChange={(e) => onFilterChange('confidence', parseFloat(e.target.value))}
              >
                <option value={0.80}>80%</option>
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.99}>99%</option>
              </select>
            </div>
          </>
        );
      case 'anomaly':
        return (
          <>
            <div className="filter-group">
              <label className="filter-label">Detection Type</label>
              <select
                className="filter-select"
                value={filters.detection_type || 'zscore'}
                onChange={(e) => onFilterChange('detection_type', e.target.value)}
              >
                {detectionTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Threshold</label>
              <input
                className="filter-input"
                type="number"
                value={filters.threshold || 2.0}
                onChange={(e) => onFilterChange('threshold', parseFloat(e.target.value))}
                min="0.5"
                max="5"
                step="0.5"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Window Size</label>
              <input
                className="filter-input"
                type="number"
                value={filters.window_size || 30}
                onChange={(e) => onFilterChange('window_size', parseInt(e.target.value) || 30)}
                min="5"
                max="100"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`analytics-filters ${className}`}>
      <div className="filters-row">
        <div className="filter-group">
          <label className="filter-label">Period</label>
          <select
            className="filter-select"
            value={filters.period || 'monthly'}
            onChange={(e) => onFilterChange('period', e.target.value)}
          >
            {periods.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Report</label>
          <select
            className="filter-select"
            value={selectedReport}
            onChange={(e) => onReportChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a report...</option>
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.name} ({report.report_type})
              </option>
            ))}
          </select>
        </div>

        {renderTabFilters()}

        <button
          className="btn btn-primary analyze-btn"
          onClick={onAnalyze}
          disabled={!selectedReport || loading}
        >
          <FiRefreshCw size={16} className={loading ? 'spinning' : ''} />
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
};

AnalyticsFilters.propTypes = {
  filters: PropTypes.object,
  reports: PropTypes.array,
  selectedReport: PropTypes.string,
  onFilterChange: PropTypes.func,
  onReportChange: PropTypes.func,
  onAnalyze: PropTypes.func,
  tab: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
};