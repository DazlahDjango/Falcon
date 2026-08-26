import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiUser,
  FiChevronRight,
  FiFilter,
  FiSearch,
} from 'react-icons/fi';
import { useAudit } from '../../../hooks/accounts/useAudit';
import { usePagination } from '../../../hooks/accounts/usePagination';

export const SecurityEventsView = () => {
  const {
    getSecurityEvents,
    securityEvents,
    isLoading,
    error,
    clearError,
    getAnomalyDetection,
    anomalyDetection,
  } = useAudit();

  const [days, setDays] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSecurityEvents();
    loadAnomalyDetection();
  }, [days]);

  const loadSecurityEvents = () => {
    getSecurityEvents({ days, limit: 100 });
  };

  const loadAnomalyDetection = () => {
    getAnomalyDetection({ days });
  };

  const handleRefresh = () => {
    loadSecurityEvents();
    loadAnomalyDetection();
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      info: FiInfo,
      warning: FiAlertTriangle,
      error: FiAlertCircle,
      critical: FiAlertCircle,
    };
    const Icon = icons[severity] || FiInfo;
    return <Icon className={`severity-icon ${severity}`} />;
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

  const filteredEvents = securityEvents.filter(event => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      event.action?.toLowerCase().includes(search) ||
      event.user?.email?.toLowerCase().includes(search) ||
      event.ip_address?.includes(search)
    );
  });

  return (
    <div className="security-events-container">
      <div className="security-events-header">
        <div className="security-events-title">
          <FiShield className="title-icon" />
          <h1>Security Events</h1>
        </div>
        <div className="security-events-actions">
          <select
            className="filter-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {anomalyDetection && (
        <div className="anomaly-summary">
          <div className="anomaly-item">
            <span className="anomaly-label">Anomalous Users</span>
            <span className="anomaly-value">{anomalyDetection.anomalous_users?.length || 0}</span>
          </div>
          <div className="anomaly-item">
            <span className="anomaly-label">Average Activity</span>
            <span className="anomaly-value">{anomalyDetection.average_activity_per_user || 0}</span>
          </div>
          <div className="anomaly-item">
            <span className="anomaly-label">Anomaly Threshold</span>
            <span className="anomaly-value">{anomalyDetection.anomaly_threshold || 0}</span>
          </div>
        </div>
      )}

      <div className="security-events-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search security events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && (
        <div className="security-events-error">
          <span>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && filteredEvents.length === 0 ? (
        <div className="security-events-loading">
          <div className="spinner" />
          <p>Loading security events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="security-events-empty">
          <FiShield className="empty-icon" />
          <p>No security events found</p>
        </div>
      ) : (
        <div className="security-events-list">
          {filteredEvents.map((event) => (
            <div key={event.id} className={`security-event-item severity-${event.severity}`}>
              <div className="event-severity">
                {getSeverityIcon(event.severity)}
              </div>
              <div className="event-content">
                <div className="event-header">
                  <span className="event-action">{event.action}</span>
                  <span className={`severity-badge ${event.severity}`}>
                    {event.severity}
                  </span>
                </div>
                <div className="event-details">
                  <span className="event-user">
                    <FiUser /> {event.user?.email || 'System'}
                  </span>
                  <span className="event-ip">IP: {event.ip_address || '-'}</span>
                  <span className="event-time">
                    <FiClock /> {formatDate(event.timestamp)}
                  </span>
                </div>
                {event.metadata && (
                  <div className="event-metadata">
                    <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default SecurityEventsView;