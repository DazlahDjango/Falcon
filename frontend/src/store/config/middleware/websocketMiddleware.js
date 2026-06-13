import { configWebSocketService } from '../../../services/config';

let maintenanceId = null;
let backupId = null;
let drId = null;

export const websocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const tenantId = state.auth?.user?.tenant_id;

  if (action.type === 'config/initializeWebSockets' && tenantId) {
    if (maintenanceId) configWebSocketService.disconnect(maintenanceId);
    maintenanceId = `maintenance_${tenantId}`;
    configWebSocketService.connectMaintenance(tenantId, (data) => {
      store.dispatch({ type: 'maintenance/setGlobalMaintenanceStatus', payload: data });
    }, (err) => console.error('[WSMiddleware] Maintenance error:', err));
  }

  if (action.type === 'config/closeWebSockets') {
    if (maintenanceId) { configWebSocketService.disconnect(maintenanceId); maintenanceId = null; }
    if (backupId) { configWebSocketService.disconnect(backupId); backupId = null; }
    if (drId) { configWebSocketService.disconnect(drId); drId = null; }
  }

  if (action.type === 'backup/setActiveBackupProgress' && action.payload?.jobId) {
    if (backupId) configWebSocketService.disconnect(backupId);
    backupId = `backup_${action.payload.jobId}`;
    configWebSocketService.connectBackupProgress(action.payload.jobId, (data) => {
      store.dispatch({ type: 'backup/updateBackupJob', payload: data });
      store.dispatch({ type: 'backup/setActiveBackupProgress', payload: data });
    }, (err) => console.error('[WSMiddleware] Backup error:', err));
  }

  if (action.type === 'dr/setActiveDRProgress' && action.payload?.executionId) {
    if (drId) configWebSocketService.disconnect(drId);
    drId = `dr_${action.payload.executionId}`;
    configWebSocketService.connectDRProgress(action.payload.executionId, (data) => {
      store.dispatch({ type: 'dr/updateDRExecution', payload: data });
      store.dispatch({ type: 'dr/setActiveDRProgress', payload: data });
    }, (err) => console.error('[WSMiddleware] DR error:', err));
  }

  return result;
};