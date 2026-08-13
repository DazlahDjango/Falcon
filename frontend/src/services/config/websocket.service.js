import { CONFIG_WS_PATHS } from '../../config/constants/websocketApiConstants';
import { getAccessToken, getTenantId } from '../accounts/storage/secureStorage';
import { websocketService } from '../websocket';

class ConfigWebSocketService {
  async connectMaintenance(tenantId = null, onMessage, onError, onClose) {
    const wsTenantId = tenantId || await getTenantId() || 'system';
    const connectionId = `maintenance_${wsTenantId}`;
    const endpoint = CONFIG_WS_PATHS.MAINTENANCE_STATUS(wsTenantId);
    return this._connect(connectionId, endpoint, onMessage, onError, onClose);
  }

  async connectBackupProgress(backupJobId, onMessage, onError, onClose) {
    const connectionId = `backup_${backupJobId}`;
    const endpoint = CONFIG_WS_PATHS.BACKUP_PROGRESS(backupJobId);
    return this._connect(connectionId, endpoint, onMessage, onError, onClose);
  }

  async connectDRProgress(executionId, onMessage, onError, onClose) {
    const connectionId = `dr_${executionId}`;
    const endpoint = CONFIG_WS_PATHS.DR_PROGRESS(executionId);
    return this._connect(connectionId, endpoint, onMessage, onError, onClose);
  }

  async _connect(id, endpoint, onMessage, onError, onClose) {
    const token = await getAccessToken();
    if (token) {
      websocketService.setAuthToken(token);
    }

    return websocketService.connect(
      id,
      endpoint,
      onMessage,
      () => console.log(`[ConfigWS] Connected: ${id}`),
      (error) => {
        console.error(`[ConfigWS] Error (${id}):`, error);
        if (onError) onError(error);
      },
      () => {
        console.log(`[ConfigWS] Closed: ${id}`);
        if (onClose) onClose();
      },
      { shouldReconnect: true }
    );
  }

  disconnect(id) {
    websocketService.disconnect(id);
  }

  disconnectAll() {
    websocketService.disconnectAll();
  }

  isConnected(id) {
    return websocketService.isConnected(id);
  }

  send(id, message) {
    return websocketService.send(id, message);
  }
}

export const configWebSocketService = new ConfigWebSocketService();
export default configWebSocketService;