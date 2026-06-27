import React from 'react';
import {
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiShield,
  FiUser,
  FiClock,
  FiChevronRight,
} from 'react-icons/fi';
import { AUDIT_SEVERITY_COLORS } from '../../../config/constants/accountsApiConstants';

export const AuditLogTable = ({ logs, isLoading, onRowClick }) => {
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
      second: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="audit-table-loading">
        <div className="spinner-sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="audit-table-container">
      <table className="audit-table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Action</th>
            <th>User</th>
            <th>Type</th>
            <th>IP Address</th>
            <th>Object</th>
            <th>Timestamp</th>
            <th className="actions-cell"></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className={`audit-table-row severity-${log.severity}`}
              onClick={() => onRowClick && onRowClick(log)}
            >
              <td>
                <span className={`severity-badge ${log.severity}`}>
                  {getSeverityIcon(log.severity)}
                  {log.severity}
                </span>
              </td>
              <td>
                <span className="action-cell">{log.action}</span>
              </td>
              <td>
                <div className="user-cell">
                  <FiUser className="user-icon" />
                  <span>{log.user?.email || 'System'}</span>
                </div>
              </td>
              <td>
                <span className="action-type">{log.action_type}</span>
              </td>
              <td>
                <code className="ip-address">{log.ip_address || '-'}</code>
              </td>
              <td>
                <div className="object-cell">
                  <span className="object-type">{log.content_type || '-'}</span>
                  <span className="object-id">{log.object_id || '-'}</span>
                </div>
              </td>
              <td>
                <div className="timestamp-cell">
                  <FiClock className="timestamp-icon" />
                  <span>{formatDate(log.timestamp)}</span>
                </div>
              </td>
              <td className="actions-cell">
                <FiChevronRight className="row-arrow" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AuditLogTable;