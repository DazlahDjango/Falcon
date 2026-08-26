import React, { useState, useEffect } from 'react';
import {
  FiLock,
  FiRefreshCw,
  FiAlertCircle,
  FiUser,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
} from 'react-icons/fi';
import { useSecurity } from '../../../hooks/accounts/useSecurity';

export const LockoutSummary = () => {
  const {
    getLockoutSummary,
    lockoutSummary,
    isLoading,
    error,
    clearError,
  } = useSecurity();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = () => {
    getLockoutSummary();
  };

  const handleRefresh = () => {
    loadSummary();
  };

  if (isLoading && !lockoutSummary) {
    return (
      <div className="lockout-summary-loading">
        <div className="spinner" />
        <p>Loading lockout summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lockout-summary-error">
        <span>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</span>
        <button onClick={clearError}>×</button>
      </div>
    );
  }

  if (!lockoutSummary) {
    return (
      <div className="lockout-summary-empty">
        <FiLock className="empty-icon" />
        <h3>No lockout data available</h3>
        <p>There are no login lockout events to display.</p>
        <button className="btn-primary" onClick={handleRefresh}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
    );
  }

  const policy = lockoutSummary.lockout_policy || {};

  return (
    <div className="lockout-summary-container">
      <div className="lockout-summary-header">
        <div className="lockout-summary-title">
          <FiLock className="title-icon" />
          <h1>Lockout Summary</h1>
        </div>
        <div className="lockout-summary-actions">
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="lockout-summary-stats">
        <div className="stat-card warning">
          <div className="stat-icon">
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <span className="stat-value">{lockoutSummary.failures_last_15m || 0}</span>
            <span className="stat-label">Failed Attempts (15m)</span>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <FiLock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{lockoutSummary.locked_attempts_last_24h || 0}</span>
            <span className="stat-label">Locked Attempts (24h)</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiMapPin />
          </div>
          <div className="stat-info">
            <span className="stat-value">{lockoutSummary.unique_ips_with_failures || 0}</span>
            <span className="stat-label">Unique IPs with Failures</span>
          </div>
        </div>

        <div className="stat-card policy">
          <div className="stat-icon">
            <FiShield />
          </div>
          <div className="stat-info">
            <span className="stat-value">{policy.failure_limit || 5}</span>
            <span className="stat-label">Failure Limit</span>
          </div>
        </div>
      </div>

      <div className="lockout-summary-policy">
        <div className="policy-card">
          <h3>Lockout Policy</h3>
          <div className="policy-grid">
            <div className="policy-item">
              <span className="policy-label">Failure Limit</span>
              <span className="policy-value">{policy.failure_limit || 5}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">Lockout Minutes</span>
              <span className="policy-value">{policy.lockout_minutes || 15}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">IP Failure Limit</span>
              <span className="policy-value">{policy.ip_failure_limit || 5}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">Lockout Enabled</span>
              <span className="policy-value">{policy.enabled !== false ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>
        </div>
      </div>

      {lockoutSummary.top_failure_identifiers && lockoutSummary.top_failure_identifiers.length > 0 && (
        <div className="lockout-summary-top-failures">
          <h3>Top Failure Identifiers</h3>
          <div className="top-failures-list">
            {lockoutSummary.top_failure_identifiers.map((item, index) => (
              <div key={index} className="top-failure-item">
                <span className="top-failure-rank">#{index + 1}</span>
                <span className="top-failure-identifier">
                  <FiUser /> {item.identifier || 'Unknown'}
                </span>
                <div className="top-failure-bar">
                  <div
                    className="top-failure-fill"
                    style={{
                      width: `${(item.count / (lockoutSummary.top_failure_identifiers[0]?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="top-failure-count">{item.count} attempts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lockout-summary-actions">
        <button className="btn-secondary" onClick={handleRefresh}>
          <FiRefreshCw /> Refresh Data
        </button>
      </div>
    </div>
  );
};
export default LockoutSummary;