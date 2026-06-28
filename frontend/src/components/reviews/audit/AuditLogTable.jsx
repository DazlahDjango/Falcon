// src/components/reviews/audit/AuditLogTable.jsx
import React from 'react';
import { Eye, User, Calendar, FileText } from 'lucide-react';
import { ReviewStatusBadge } from '../common';

const AuditLogTable = ({ data, onView }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="audit-log-table-container">
      <table className="audit-log-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Model</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((log) => (
            <tr key={log.id} className="audit-log-table-row">
              <td className="audit-log-table-date">
                <span className="audit-log-table-date-value">{formatDate(log.created_at)}</span>
              </td>
              <td className="audit-log-table-user">
                <div className="audit-log-table-user-info">
                  <div className="audit-log-table-avatar">
                    {log.actor_name?.charAt(0) || 'U'}
                  </div>
                  <span>{log.actor_name || 'Unknown'}</span>
                </div>
              </td>
              <td>
                <span
                  className="audit-log-table-action"
                  style={{ backgroundColor: getActionColor(log.action) + '20', color: getActionColor(log.action) }}
                >
                  {log.action}
                </span>
              </td>
              <td className="audit-log-table-model">
                <span className="audit-log-table-model-name">{log.model_name}</span>
                <span className="audit-log-table-model-id">{log.object_id}</span>
              </td>
              <td className="audit-log-table-details">
                {log.changes && Object.keys(log.changes).length > 0 ? (
                  <span className="audit-log-table-details-count">
                    {Object.keys(log.changes).length} changes
                  </span>
                ) : (
                  <span className="audit-log-table-details-none">—</span>
                )}
              </td>
              <td>
                <button
                  className="audit-log-table-action-btn"
                  onClick={() => onView(log.id)}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;