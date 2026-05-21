import { FiAlertTriangle, FiClock } from 'react-icons/fi';
import { useConfigContext } from '../../../contexts/config/ConfigContext';

/**
 * App-wide maintenance banner — driven by ConfigContext WebSocket (real-time).
 */
export const GlobalMaintenanceBanner = () => {
  const { globalMaintenance, maintenanceWsConnected } = useConfigContext();

  if (!globalMaintenance?.active) return null;

  const isFull = globalMaintenance.type === 'full';
  const bannerClass = isFull
    ? 'config-global-maintenance-banner config-global-maintenance-banner--full'
    : 'config-global-maintenance-banner config-global-maintenance-banner--partial';

  const expectedEnd = globalMaintenance.expectedEnd
    ? new Date(globalMaintenance.expectedEnd).toLocaleString()
    : null;

  return (
    <div className={bannerClass} role="alert">
      <div className="config-global-maintenance-banner__body">
        <div className="config-global-maintenance-banner__icon-wrap">
          <FiAlertTriangle />
        </div>
        <div>
          <div className="config-global-maintenance-banner__title">
            {isFull ? 'Full System Maintenance' : 'Partial Maintenance Active'}
          </div>
          {globalMaintenance.message && (
            <div className="config-global-maintenance-banner__message">{globalMaintenance.message}</div>
          )}
          {globalMaintenance.affectedApps?.length > 0 && !isFull && (
            <div className="config-global-maintenance-banner__meta">
              Affected: {globalMaintenance.affectedApps.join(', ')}
            </div>
          )}
          {expectedEnd && (
            <div className="config-global-maintenance-banner__meta">
              <FiClock style={{ display: 'inline', marginRight: 4 }} />
              Expected completion: {expectedEnd}
            </div>
          )}
        </div>
      </div>
      <span
        className={`config-global-maintenance-banner__live ${
          maintenanceWsConnected
            ? 'config-global-maintenance-banner__live--connected'
            : 'config-global-maintenance-banner__live--disconnected'
        }`}
        title={maintenanceWsConnected ? 'Live updates connected' : 'Polling fallback'}
      >
        <span className="config-global-maintenance-banner__live-dot" />
        {maintenanceWsConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};
