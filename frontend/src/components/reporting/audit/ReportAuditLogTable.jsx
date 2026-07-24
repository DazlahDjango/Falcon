import React from 'react';
import { AUDIT_ACTION_DISPLAY, DATA_SENSITIVITY_COLORS } from '../../../config/constants';

export const ReportAuditLogTable = ({ logs, onViewDetail }) => {
  return (
    <div className="reporting-table-container">
      <table className="reporting-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Template Code</th>
            <th>Actor</th>
            <th>IP Address</th>
            <th>Sensitivity</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                No audit logs recorded.
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              const actionLabel = AUDIT_ACTION_DISPLAY[log.action] || log.action;

              return (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{actionLabel}</td>
                  <td>
                    <span className="reporting-badge reporting-badge-format">
                      {log.template_code || 'N/A'}
                    </span>
                  </td>
                  <td>{log.actor_email || 'System'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.ip_address || '127.0.0.1'}</td>
                  <td>
                    <span className={`reporting-badge reporting-badge-${log.sensitivity_level || 'internal'}`}>
                      {log.sensitivity_level || 'internal'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#94a3b8' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className="reporting-btn reporting-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => onViewDetail(log)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportAuditLogTable;
