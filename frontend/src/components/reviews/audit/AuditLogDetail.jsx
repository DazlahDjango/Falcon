// src/components/reviews/audit/AuditLogDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useReviewsAuditLogs } from '../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../common';

const AuditLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, canView } = useReviewsAuditLogs();

  useEffect(() => {
    if (id && canView) {
      fetchOne(id);
    }
  }, [id, canView, fetchOne]);

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
    }
  };

  if (!canView) {
    return (
      <div className="audit-log-detail">
        <div className="audit-log-detail-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  if (loading) return <ReviewLoading size="lg" text="Loading audit log..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!selected) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action) => {
    const colors = {
      create: '#22c55e',
      update: '#3b82f6',
      delete: '#ef4444',
      approve: '#8b5cf6',
      reject: '#ef4444',
      submit: '#f59e0b',
      lock: '#06b6d4',
      calibrate: '#8b5cf6',
      activate: '#22c55e',
      deactivate: '#f59e0b',
    };
    return colors[action] || '#6b7280';
  };

  return (
    <div className="audit-log-detail">
      <div className="audit-log-detail-header">
        <button className="audit-log-detail-back" onClick={() => navigate('/reviews/audit')}>
          <ArrowLeft size={20} />
          Back to Audit Logs
        </button>
        <div className="audit-log-detail-actions">
          <button className="audit-log-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="audit-log-detail-content">
        <div className="audit-log-detail-title-section">
          <h1 className="audit-log-detail-title">Audit Log Entry</h1>
          <span
            className="audit-log-detail-action"
            style={{ backgroundColor: getActionColor(selected.action) + '20', color: getActionColor(selected.action) }}
          >
            {selected.action}
          </span>
        </div>

        <div className="audit-log-detail-grid">
          <div className="audit-log-detail-info">
            <div className="audit-log-detail-info-item">
              <span className="audit-log-detail-info-label">Timestamp</span>
              <span className="audit-log-detail-info-value">
                <Calendar size={16} />
                {formatDate(selected.created_at)}
              </span>
            </div>
            <div className="audit-log-detail-info-item">
              <span className="audit-log-detail-info-label">User</span>
              <span className="audit-log-detail-info-value">
                <User size={16} />
                {selected.actor_name || 'Unknown'}
              </span>
            </div>
            <div className="audit-log-detail-info-item">
              <span className="audit-log-detail-info-label">Model</span>
              <span className="audit-log-detail-info-value">
                <FileText size={16} />
                {selected.model_name}
              </span>
            </div>
            <div className="audit-log-detail-info-item">
              <span className="audit-log-detail-info-label">Object ID</span>
              <span className="audit-log-detail-info-value">{selected.object_id}</span>
            </div>
            {selected.ip_address && (
              <div className="audit-log-detail-info-item">
                <span className="audit-log-detail-info-label">IP Address</span>
                <span className="audit-log-detail-info-value">{selected.ip_address}</span>
              </div>
            )}
          </div>

          <div className="audit-log-detail-changes">
            <h3 className="audit-log-detail-changes-title">Changes</h3>
            {selected.changes && Object.keys(selected.changes).length > 0 ? (
              <div className="audit-log-detail-changes-list">
                {Object.entries(selected.changes).map(([key, value]) => (
                  <div key={key} className="audit-log-detail-changes-item">
                    <span className="audit-log-detail-changes-key">{key}</span>
                    <div className="audit-log-detail-changes-values">
                      <span className="audit-log-detail-changes-old">{value.old || '—'}</span>
                      <span className="audit-log-detail-changes-arrow">→</span>
                      <span className="audit-log-detail-changes-new">{value.new || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="audit-log-detail-changes-empty">No changes recorded</div>
            )}
          </div>
        </div>

        {selected.checksum_before && selected.checksum_after && (
          <div className="audit-log-detail-checksums">
            <h3 className="audit-log-detail-checksums-title">Integrity Checksums</h3>
            <div className="audit-log-detail-checksums-grid">
              <div className="audit-log-detail-checksums-item">
                <span className="audit-log-detail-checksums-label">Before</span>
                <span className="audit-log-detail-checksums-value">{selected.checksum_before}</span>
              </div>
              <div className="audit-log-detail-checksums-item">
                <span className="audit-log-detail-checksums-label">After</span>
                <span className="audit-log-detail-checksums-value">{selected.checksum_after}</span>
              </div>
            </div>
            <div className="audit-log-detail-checksums-status">
              {selected.checksum_before === selected.checksum_after ? (
                <span className="audit-log-detail-checksums-verified">
                  <CheckCircle size={16} color="#22c55e" />
                  Checksums match
                </span>
              ) : (
                <span className="audit-log-detail-checksums-mismatch">
                  <XCircle size={16} color="#ef4444" />
                  Checksums mismatch
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogDetail;