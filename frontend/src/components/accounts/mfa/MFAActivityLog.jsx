import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiShield,
  FiSmartphone,
  FiKey,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMFA';

export const MFAActivityLog = () => {
  const {
    getAuditLogs,
    getAuditSummary,
    auditLogs,
    auditSummary,
    isLoading,
    error,
    clearMfaError,
  } = useMFA();

  const [filters, setFilters] = useState({
    event_type: '',
    success: null,
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
    loadSummary();
  }, [filters]);

  const loadLogs = async () => {
    clearMfaError();
    await getAuditLogs(filters);
  };

  const loadSummary = async () => {
    await getAuditSummary();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (eventType) => {
    const icons = {
      enroll: FiShield,
      verify: FiCheckCircle,
      disable: FiXCircle,
      recovery: FiKey,
      failed_recovery: FiAlertTriangle,
      step_up: FiShield,
      step_up_failed: FiAlertTriangle,
    };
    const Icon = icons[eventType] || FiClock;
    return <Icon className="event-icon" />;
  };

  const getEventLabel = (eventType) => {
    const labels = {
      enroll: 'Device Enrolled',
      verify: 'Verification',
      disable: 'Device Disabled',
      recovery: 'Recovery',
      failed_recovery: 'Failed Recovery',
      step_up: 'Step-Up',
      step_up_failed: 'Step-Up Failed',
    };
    return labels[eventType] || eventType;
  };

  const getSuccessBadge = (success) => {
    if (success === true) {
      return <span className="success-badge"><FiCheckCircle /> Success</span>;
    }
    return <span className="failed-badge"><FiXCircle /> Failed</span>;
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.message?.toLowerCase().includes(search) ||
      log.ip_address?.includes(search) ||
      log.user?.email?.toLowerCase().includes(search)
    );
  });

  if (isLoading && auditLogs.length === 0) {
    return (
      <div className="mfa-activity-loading">
        <div className="spinner-sm" />
        <span>Loading activity...</span>
      </div>
    );
  }

  return (
    <div className="mfa-activity-container">
      <div className="mfa-activity-header">
        <div className="mfa-activity-title">
          <FiClock className="title-icon" />
          <h3>MFA Activity Log</h3>
        </div>
        <button className="btn-icon" onClick={loadLogs}>
          <FiRefreshCw className={isLoading ? 'spinning' : ''} />
        </button>
      </div>

      {auditSummary && (
        <div className="mfa-activity-summary">
          <div className="summary-item">
            <span className="summary-label">Total Events</span>
            <span className="summary-value">{auditSummary.total_events || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Success Rate</span>
            <span className="summary-value">
              {auditSummary.success_rate?.overall || 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Today</span>
            <span className="summary-value">
              {auditSummary.success_rate?.today || 0}%
            </span>
          </div>
        </div>
      )}

      <div className="mfa-activity-filters">
        <div className="activity-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="activity-filters">
          <select
            className="filter-select"
            value={filters.event_type}
            onChange={(e) => handleFilterChange('event_type', e.target.value)}
          >
            <option value="">All Events</option>
            <option value="enroll">Enroll</option>
            <option value="verify">Verify</option>
            <option value="disable">Disable</option>
            <option value="recovery">Recovery</option>
            <option value="step_up">Step-Up</option>
          </select>
          <select
            className="filter-select"
            value={filters.success == null ? '' : filters.success.toString()}
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange('success', val === '' ? null : val === 'true');
            }}
          >
            <option value="">All Status</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mfa-activity-error">
          <FiAlertTriangle className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <div className="mfa-activity-empty">
          <FiClock className="empty-icon" />
          <p>No activity records found</p>
        </div>
      ) : (
        <div className="mfa-activity-list">
          {filteredLogs.map((log) => (
            <div key={log.id} className="activity-item">
              <div className="activity-icon">{getEventIcon(log.event_type)}</div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-event">{getEventLabel(log.event_type)}</span>
                  {getSuccessBadge(log.success)}
                </div>
                <div className="activity-details">
                  {log.message && <span className="activity-message">{log.message}</span>}
                  {log.device_name && (
                    <span className="activity-device">
                      <FiSmartphone /> {log.device_name}
                    </span>
                  )}
                  {log.ip_address && (
                    <span className="activity-ip">IP: {log.ip_address}</span>
                  )}
                  <span className="activity-time">{formatDate(log.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MFAActivityLog;
