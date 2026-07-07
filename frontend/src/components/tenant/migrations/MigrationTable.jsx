// components/tenant/migrations/MigrationTable.jsx
import React from 'react';
import { FiEye, FiEdit, FiTrash2, FiPlay, FiRefreshCw, FiRotateCcw, FiCode } from 'react-icons/fi';
import MigrationStatusBadge from './MigrationStatusBadge';

const MigrationTable = ({ migrations, onView, onEdit, onDelete, onApply, onRollback, onPreviewSql, onRefresh, loading }) => {
  if (!migrations || migrations.length === 0) {
    return (
      <div className="migration-empty-state">
        <div className="migration-empty-icon">📦</div>
        <p className="migration-empty-title">No migrations found</p>
        <p className="migration-empty-desc">No migration records available</p>
      </div>
    );
  }

  return (
    <div className="migration-card" style={{ overflowX: 'auto' }}>
      <table className="migration-table">
        <thead className="migration-table-head">
          <tr>
            <th>Migration</th>
            <th>App</th>
            <th>Status</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Execution Time</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody className="migration-table-body">
          {migrations.map((migration) => (
            <tr key={migration.id}>
              <td>
                <div className="migration-font-semibold migration-text-sm" style={{ color: '#0f172a' }}>
                  {migration.migration_name}
                </div>
              </td>
              <td>
                <span className="migration-badge migration-badge-gray">{migration.app_name}</span>
              </td>
              <td><MigrationStatusBadge status={migration.status} /></td>
              <td className="migration-text-sm migration-text-muted">
                {migration.started_at ? new Date(migration.started_at).toLocaleString() : 'N/A'}
              </td>
              <td className="migration-text-sm migration-text-muted">
                {migration.completed_at ? new Date(migration.completed_at).toLocaleString() : 'N/A'}
              </td>
              <td className="migration-text-sm migration-text-muted">
                {migration.execution_time_ms ? `${migration.execution_time_ms}ms` : 'N/A'}
              </td>
              <td>
                <div className="migration-flex migration-gap-2" style={{ justifyContent: 'center' }}>
                  <button
                    className="migration-btn migration-btn-secondary migration-btn-sm"
                    onClick={() => onView && onView(migration.id)}
                    disabled={loading}
                    title="View"
                  >
                    <FiEye size={14} />
                  </button>
                  <button
                    className="migration-btn migration-btn-secondary migration-btn-sm"
                    onClick={() => onPreviewSql && onPreviewSql(migration.id)}
                    disabled={loading}
                    title="Preview SQL"
                  >
                    <FiCode size={14} />
                  </button>
                  {migration.status === 'PENDING' && (
                    <button
                      className="migration-btn migration-btn-success migration-btn-sm"
                      onClick={() => onApply && onApply(migration.id)}
                      disabled={loading}
                      title="Apply"
                    >
                      <FiPlay size={14} />
                    </button>
                  )}
                  {migration.status === 'COMPLETED' && (
                    <button
                      className="migration-btn migration-btn-sm"
                      onClick={() => onRollback && onRollback(migration.id)}
                      disabled={loading}
                      title="Rollback"
                      style={{ background: '#f97316', borderColor: '#ea580c', color: 'white' }}
                    >
                      <FiRotateCcw size={14} />
                    </button>
                  )}
                  {(migration.status === 'COMPLETED' || migration.status === 'FAILED') && (
                    <button
                      className="migration-btn migration-btn-secondary migration-btn-sm"
                      onClick={() => onRefresh && onRefresh(migration.id)}
                      disabled={loading}
                      title="Refresh Status"
                    >
                      <FiRefreshCw size={14} />
                    </button>
                  )}
                  <button
                    className="migration-btn migration-btn-danger migration-btn-sm"
                    onClick={() => onDelete && onDelete(migration.id)}
                    disabled={loading}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
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

export default MigrationTable;