import React, { useState } from 'react';
import {
  FiFileText,
  FiDownload,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiClock,
  FiBarChart2,
} from 'react-icons/fi';
import { useAudit } from '../../../hooks/accounts/useAudit';

export const ComplianceReport = () => {
  const { getComplianceReport, complianceReport, isLoading, error, clearError } = useAudit();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    await getComplianceReport({ start_date: startDate, end_date: endDate });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const report = complianceReport;

  return (
    <div className="compliance-report-container">
      <div className="compliance-report-header">
        <div className="compliance-report-title">
          <FiFileText className="title-icon" />
          <h1>Compliance Report</h1>
        </div>
      </div>

      <form className="compliance-report-form" onSubmit={handleGenerate}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <div className="form-input-wrapper">
              <FiCalendar className="input-icon" />
              <input
                id="startDate"
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <div className="form-input-wrapper">
              <FiCalendar className="input-icon" />
              <input
                id="endDate"
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-sm" />
                  Generating...
                </>
              ) : (
                <>
                  <FiRefreshCw /> Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="compliance-report-error">
          <FiAlertCircle className="error-icon" />
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {report && (
        <div className="compliance-report-content">
          <div className="report-summary">
            <div className="summary-header">
              <h3>Report Summary</h3>
              <span className="report-period">
                {formatDate(report.period?.start)} - {formatDate(report.period?.end)}
              </span>
            </div>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Actions</span>
                <span className="summary-value">{report.summary?.total_actions || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Unique Users</span>
                <span className="summary-value">{report.summary?.unique_users || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Critical Events</span>
                <span className="summary-value">{report.summary?.critical_events || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Avg Daily Actions</span>
                <span className="summary-value">{report.summary?.average_daily_actions || 0}</span>
              </div>
            </div>
          </div>

          <div className="report-sections">
            {report.action_breakdown && report.action_breakdown.length > 0 && (
              <div className="report-section">
                <h4>Action Breakdown</h4>
                <div className="breakdown-list">
                  {report.action_breakdown.map((item) => (
                    <div key={item.action_type} className="breakdown-item">
                      <span className="breakdown-label">{item.action_type}</span>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{
                            width: `${(item.count / report.summary?.total_actions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="breakdown-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.top_users && report.top_users.length > 0 && (
              <div className="report-section">
                <h4>Top Active Users</h4>
                <div className="top-users-list">
                  {report.top_users.map((user) => (
                    <div key={user.user__email} className="top-user-item">
                      <span className="top-user-name">
                        {user.user__first_name} {user.user__last_name}
                      </span>
                      <span className="top-user-email">{user.user__email}</span>
                      <span className="top-user-count">{user.action_count} actions</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.daily_activity && report.daily_activity.length > 0 && (
              <div className="report-section">
                <h4>Daily Activity</h4>
                <div className="daily-activity-list">
                  {report.daily_activity.map((day) => (
                    <div key={day.date} className="daily-item">
                      <span className="daily-date">{formatDate(day.date)}</span>
                      <div className="daily-bar">
                        <div
                          className="daily-fill"
                          style={{
                            width: `${(day.count / report.summary?.total_actions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="daily-count">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="report-actions">
            <button className="btn-secondary">
              <FiDownload /> Export PDF
            </button>
            <button className="btn-secondary">
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>
      )}

      {submitted && !report && !isLoading && !error && (
        <div className="compliance-report-empty">
          <FiFileText className="empty-icon" />
          <p>No data available for the selected date range</p>
        </div>
      )}
    </div>
  );
};
export default ComplianceReport;