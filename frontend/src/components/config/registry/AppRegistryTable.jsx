import { FiEdit2, FiShield } from 'react-icons/fi';
import { RECOVERY_PRIORITY_LABELS } from '../../../config/constants/configConstants';
import { CIABadge } from './CIABadge';
import { StatusBadge } from '../common/StatusBadge';

export const AppRegistryTable = ({ apps, canEdit, onEdit }) => {
  if (!apps.length) {
    return (
      <div className="config-registry-empty">
        No registered apps. Sync registry from canonical definitions.
      </div>
    );
  }

  return (
    <div className="config-registry-table-wrap">
      <table className="config-registry-table">
        <thead>
          <tr>
            <th>App</th>
            <th>CIA Classification</th>
            <th>Priority</th>
            <th>RPO / RTO</th>
            <th>Retention</th>
            <th>Deps</th>
            <th>Health</th>
            {canEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr key={app.id}>
              <td>
                <div className="config-registry-app-name">{app.display_name}</div>
                <div className="config-registry-app-slug">{app.name}</div>
              </td>
              <td>
                <CIABadge classification={app.cia_classification} />
              </td>
              <td>
                {app.is_critical ? (
                  <StatusBadge status="running" customLabel="Critical" size="sm" />
                ) : (
                  <StatusBadge status="unknown" customLabel="Standard" size="sm" />
                )}
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                  {RECOVERY_PRIORITY_LABELS[app.recovery_priority] || `P${app.recovery_priority}`}
                </div>
              </td>
              <td style={{ color: '#4b5563' }}>
                {app.rpo_minutes}m / {app.rto_minutes}m
              </td>
              <td style={{ color: '#4b5563' }}>{app.backup_retention_days}d</td>
              <td>
                <span className="config-registry-cia-badge config-registry-cia-badge--standard">
                  {app.dependency_count ?? 0}
                </span>
              </td>
              <td>
                {app.health_check_endpoint ? (
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiShield /> Configured
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Not set</span>
                )}
              </td>
              {canEdit && (
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => onEdit(app)}
                    className="config-registry-btn-secondary"
                    style={{ padding: '0.5rem' }}
                    title="Edit registry entry"
                  >
                    <FiEdit2 />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
