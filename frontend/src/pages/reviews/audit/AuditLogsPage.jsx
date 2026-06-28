// src/pages/reviews/audit/AuditLogsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { AuditLogList } from '../../../components/reviews/audit';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const AuditLogsPage = () => {
  const navigate = useNavigate();
  const { canViewAuditLogs, isAdmin } = useReviewsPermissions();

  if (!canViewAuditLogs && !isAdmin) {
    return (
      <div className="audit-logs-page">
        <div className="audit-logs-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-logs-page">
      <div className="audit-logs-page-header">
        <button className="audit-logs-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Audit Logs', path: '/reviews/audit', isActive: true },
          ]}
        />
        <h1 className="audit-logs-page-title">
          <FileText size={24} />
          Audit Logs
        </h1>
      </div>

      <AuditLogList />
    </div>
  );
};

export default AuditLogsPage;