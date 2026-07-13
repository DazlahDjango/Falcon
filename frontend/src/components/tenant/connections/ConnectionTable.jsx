// components/tenant/connections/ConnectionTable.jsx
import React from 'react';
import { FiEye, FiEdit, FiTrash2, FiPower, FiRefreshCw, FiPause, FiPlay } from 'react-icons/fi';
import ConnectionStatusBadge from './ConnectionStatusBadge';

const ConnectionTable = ({ connections, onView, onEdit, onDelete, onClose, onStatus, onPause, onResume, loading }) => {
  if (!connections || connections.length === 0) {
    return (
      <div className="connection-empty-state">
        <div className="connection-empty-icon">🔌</div>
        <p className="connection-empty-title">No connections found</p>
        <p className="connection-empty-desc">No active connections available</p>
      </div>
    );
  }

  return (
    <div className="connection-card" style={{ overflowX: 'auto', padding: 0, border: 'none' }}>
      <table className="connection-table">
        <thead className="connection-table-head">
          <tr>
            <th>Connection ID</th>
            <th>Organization</th>
            <th>Database</th>
            <th>Schema</th>
            <th>Status</th>
            <th>Last Used</th>
            <th>Connected</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody className="connection-table-body">
          {connections.map((conn) => (
            <tr key={conn.id}>
              <td>
                <div className="connection-font-semibold connection-text-xs" style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                  {conn.connection_id || conn.id?.slice(0, 8)}
                </div>
              </td>
              <td className="connection-text-sm" style={{ fontWeight: 500, color: '#475569' }}>
                {conn.organization_name || conn.organization || 'N/A'}
              </td>
              <td className="connection-text-sm connection-text-muted">{conn.database_name || 'default'}</td>
              <td className="connection-text-sm connection-text-muted">{conn.schema_name || 'N/A'}</td>
              <td><ConnectionStatusBadge status={conn.status} /></td>
              <td className="connection-text-sm connection-text-muted">
                {conn.last_used_at ? new Date(conn.last_used_at).toLocaleString() : 'Never'}
              </td>
              <td className="connection-text-sm connection-text-muted">
                {conn.connected_at ? new Date(conn.connected_at).toLocaleString() : 'N/A'}
              </td>
              <td>
                <div className="connection-flex connection-gap-2" style={{ justifyContent: 'center' }}>
                  <button
                    className="connection-btn connection-btn-secondary connection-btn-sm"
                    onClick={() => onView && onView(conn.id)}
                    disabled={loading}
                    title="View details"
                  >
                    <FiEye size={13} />
                  </button>
                  
                  {(conn.status === 'ACTIVE' || conn.status === 'IDLE') && (
                    <button
                      className="connection-btn connection-btn-warning connection-btn-sm"
                      onClick={() => onClose && onClose(conn.id)}
                      disabled={loading}
                      title="Force close connection"
                    >
                      <FiPower size={13} />
                    </button>
                  )}

                  <button
                    className="connection-btn connection-btn-success connection-btn-sm"
                    onClick={() => onStatus && onStatus(conn.id)}
                    disabled={loading}
                    title="Refresh status"
                  >
                    <FiRefreshCw size={13} />
                  </button>

                  <button
                    className="connection-btn connection-btn-secondary connection-btn-sm"
                    onClick={() => onPause && onPause(conn.organization)}
                    disabled={loading}
                    title="Pause organization connections"
                    style={{ background: '#fee2e2', color: '#991b1b' }}
                  >
                    <FiPause size={13} />
                  </button>

                  <button
                    className="connection-btn connection-btn-secondary connection-btn-sm"
                    onClick={() => onResume && onResume(conn.organization)}
                    disabled={loading}
                    title="Resume organization connections"
                    style={{ background: '#dcfce7', color: '#166534' }}
                  >
                    <FiPlay size={13} />
                  </button>

                  <button
                    className="connection-btn connection-btn-danger connection-btn-sm"
                    onClick={() => onDelete && onDelete(conn.id)}
                    disabled={loading}
                    title="Delete record"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConnectionTable;