import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiClock,
  FiShield,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiChevronRight,
  FiChevronDown,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { useAudit } from '../../../hooks/accounts/useAudit';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const AuditLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLog, selectedLog: log, isLoading, error, clearError } = useAudit();

  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    changes: true,
    request: false,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      getLog(id);
    }
  }, [id, getLog]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  if (isLoading && !log) {
    return (
      <div className="audit-detail-loading">
        <div className="spinner" />
        <p>Loading audit log details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-detail-error">
        <p>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.AUDIT_LOGS)}>
          <FiArrowLeft /> Back to Audit Logs
        </button>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="audit-detail-empty">
        <p>Audit log not found</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.AUDIT_LOGS)}>
          <FiArrowLeft /> Back to Audit Logs
        </button>
      </div>
    );
  }

  return (
    <div className="audit-detail-container">
      <div className="audit-detail-header">
        <button className="back-btn" onClick={() => navigate(ACCOUNTS_ROUTES.AUDIT_LOGS)}>
          <FiArrowLeft /> Back to Audit Logs
        </button>
        <button className="btn-secondary" onClick={() => copyToClipboard(log)}>
          {copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="audit-detail-card">
        <div className="audit-detail-top">
          <div className="audit-detail-severity">
            <span className={`severity-badge ${log.severity}`}>
              {getSeverityIcon(log.severity)}
              {log.severity}
            </span>
          </div>
          <div className="audit-detail-action">
            <h1>{log.action}</h1>
            <span className="action-type">{log.action_type}</span>
          </div>
        </div>

        <div className="audit-detail-meta">
          <div className="meta-item">
            <FiUser className="meta-icon" />
            <div>
              <span className="meta-label">User</span>
              <span className="meta-value">{log.user?.email || 'System'}</span>
            </div>
          </div>
          <div className="meta-item">
            <FiClock className="meta-icon" />
            <div>
              <span className="meta-label">Timestamp</span>
              <span className="meta-value">{formatDate(log.timestamp)}</span>
            </div>
          </div>
          <div className="meta-item">
            <FiShield className="meta-icon" />
            <div>
              <span className="meta-label">IP Address</span>
              <span className="meta-value">{log.ip_address || '-'}</span>
            </div>
          </div>
          <div className="meta-item">
            <FiShield className="meta-icon" />
            <div>
              <span className="meta-label">User Agent</span>
              <span className="meta-value">{log.user_agent || '-'}</span>
            </div>
          </div>
        </div>

        <div className="audit-detail-object">
          <div className="object-item">
            <span className="object-label">Content Type</span>
            <span className="object-value">{log.content_type || '-'}</span>
          </div>
          <div className="object-item">
            <span className="object-label">Object ID</span>
            <span className="object-value">{log.object_id || '-'}</span>
          </div>
          <div className="object-item">
            <span className="object-label">Object Representation</span>
            <span className="object-value">{log.object_repr || '-'}</span>
          </div>
        </div>

        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div className="audit-detail-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('metadata')}
            >
              <span>Metadata</span>
              {expandedSections.metadata ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            {expandedSections.metadata && (
              <div className="section-content">
                <pre className="json-view">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {log.changes && Object.keys(log.changes).length > 0 && (
          <div className="audit-detail-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('changes')}
            >
              <span>Changes</span>
              {expandedSections.changes ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            {expandedSections.changes && (
              <div className="section-content">
                <div className="changes-grid">
                  {Object.entries(log.changes).map(([field, change]) => (
                    <div key={field} className="change-item">
                      <span className="change-field">{field}</span>
                      <div className="change-values">
                        <span className="change-old">{change.old}</span>
                        <FiChevronRight className="change-arrow" />
                        <span className="change-new">{change.new}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {log.request_method && (
          <div className="audit-detail-section">
            <button
              className="section-toggle"
              onClick={() => toggleSection('request')}
            >
              <span>Request Details</span>
              {expandedSections.request ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            {expandedSections.request && (
              <div className="section-content">
                <div className="request-grid">
                  <div className="request-item">
                    <span className="request-label">Method</span>
                    <span className="request-value">{log.request_method}</span>
                  </div>
                  <div className="request-item">
                    <span className="request-label">Path</span>
                    <span className="request-value">{log.request_path}</span>
                  </div>
                  <div className="request-item">
                    <span className="request-label">Referer</span>
                    <span className="request-value">{log.referer || '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default AuditLogDetail;