import { FiList } from 'react-icons/fi';
import { RECOVERY_PRIORITY_LABELS } from '../../../config/constants/configConstants';
import { StatusBadge } from '../common/StatusBadge';

const extractList = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const RecoverySequencePanel = ({ recoveryData, priorityData, isLoading }) => {
  const recovery = extractList(recoveryData);
  const priority = extractList(priorityData);

  if (isLoading) {
    return <div className="config-registry-skeleton" />;
  }

  return (
    <div className="config-registry-recovery-grid">
      <div className="config-registry-recovery-panel">
        <div className="config-registry-recovery-panel-header">
          <h3 className="config-registry-recovery-panel-title">
            <FiList style={{ color: '#2563eb' }} />
            Recovery Sequence
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
            Topological order (hard dependencies first)
          </p>
        </div>
        <ol className="config-registry-recovery-list">
          {recovery.length === 0 ? (
            <li style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No apps in recovery sequence</li>
          ) : (
            recovery.map((app, index) => (
              <li key={app.id} className="config-registry-recovery-item">
                <span className="config-registry-recovery-rank">{index + 1}</span>
                <span style={{ fontWeight: 500 }}>{app.display_name}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>P{app.recovery_priority}</span>
              </li>
            ))
          )}
        </ol>
      </div>

      <div className="config-registry-recovery-panel">
        <div className="config-registry-recovery-panel-header">
          <h3 className="config-registry-recovery-panel-title">
            <FiList style={{ color: '#16a34a' }} />
            Priority Order
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
            Availability tier by recovery priority
          </p>
        </div>
        <ul className="config-registry-recovery-list">
          {priority.length === 0 ? (
            <li style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No apps registered</li>
          ) : (
            priority.map((app) => (
              <li key={app.id} className="config-registry-recovery-item" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{app.display_name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {app.is_critical && <StatusBadge status="running" customLabel="Critical" size="sm" />}
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {RECOVERY_PRIORITY_LABELS[app.recovery_priority] || `P${app.recovery_priority}`}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
