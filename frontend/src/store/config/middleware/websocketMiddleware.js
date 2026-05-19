let wsMaintenance = null;
let wsBackup = null;
let wsDR = null;

export const websocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const tenantId = state.auth?.user?.tenant_id;
  if (action.type === 'config/initializeWebSockets' && tenantId) {
    if (wsMaintenance) wsMaintenance.close();
    wsMaintenance = new WebSocket(`${import.meta.env.VITE_WS_URL}/config/maintenance/${tenantId}`);
    wsMaintenance.onmessage = (event) => {
      const data = JSON.parse(event.data);
      store.dispatch({ type: 'maintenance/setGlobalMaintenanceStatus', payload: data });
    };
    wsMaintenance.onerror = (error) => console.error('[WSMiddleware] Maintenance error:', error);
  }
  if (action.type === 'config/closeWebSockets') {
    if (wsMaintenance) { wsMaintenance.close(); wsMaintenance = null; }
    if (wsBackup) { wsBackup.close(); wsBackup = null; }
    if (wsDR) { wsDR.close(); wsDR = null; }
  }
  if (action.type === 'backup/setActiveBackupProgress' && action.payload?.jobId) {
    if (wsBackup) wsBackup.close();
    wsBackup = new WebSocket(`${import.meta.env.VITE_WS_URL}/config/backup/${action.payload.jobId}`);
    wsBackup.onmessage = (event) => {
      const data = JSON.parse(event.data);
      store.dispatch({ type: 'backup/updateBackupJob', payload: data });
      store.dispatch({ type: 'backup/setActiveBackupProgress', payload: data });
    };
  }
  if (action.type === 'dr/setActiveDRProgress' && action.payload?.executionId) {
    if (wsDR) wsDR.close();
    wsDR = new WebSocket(`${import.meta.env.VITE_WS_URL}/config/dr/${action.payload.executionId}`);
    wsDR.onmessage = (event) => {
      const data = JSON.parse(event.data);
      store.dispatch({ type: 'dr/updateDRExecution', payload: data });
      store.dispatch({ type: 'dr/setActiveDRProgress', payload: data });
    };
  }
  return result;
};