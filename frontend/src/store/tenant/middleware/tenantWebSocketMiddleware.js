// frontend/src/store/tenant/middleware/tenantWebSocketMiddleware.js
import { createListenerMiddleware } from '@reduxjs/toolkit';
import TenantWebSocketService from '../../../services/tenant/websocket.service';
import { fetchTenants, fetchTenantById } from '../slice/tenantSlice';
import { fetchQuotaWarnings } from '../slice/tenantResourceSlice';
import { showToast } from '../slice/tenantUISlice';

const webSocketMiddleware = createListenerMiddleware();
let wsService = null;

// Initialize WebSocket connection
webSocketMiddleware.startListening({
    predicate: (action) => action.type === 'tenant/initializeWebSocket',
    effect: (action, listenerApi) => {
        const { tenantId } = action.payload;
        
        if (wsService) {
            wsService.disconnect();
        }
        
        wsService = TenantWebSocketService;
        wsService.connect(tenantId, {
            onStatusChange: (data) => {
                listenerApi.dispatch(fetchTenants());
                listenerApi.dispatch(fetchTenantById(tenantId));
                listenerApi.dispatch(showToast({
                    message: `Tenant status changed to ${data.status}`,
                    type: 'info',
                }));
            },
            onQuotaWarning: (data) => {
                listenerApi.dispatch(fetchQuotaWarnings(tenantId));
                listenerApi.dispatch(showToast({
                    message: `Quota warning: ${data.resource_type} at ${data.percentage}%`,
                    type: 'warning',
                }));
            },
            onProvisioningProgress: (data) => {
                listenerApi.dispatch(showToast({
                    message: `Provisioning: ${data.progress}% - ${data.step}`,
                    type: 'info',
                }));
            },
            onBackupProgress: (data) => {
                listenerApi.dispatch(showToast({
                    message: `Backup: ${data.progress}% complete`,
                    type: 'info',
                }));
            },
        });
    },
});

// Disconnect WebSocket on logout
webSocketMiddleware.startListening({
    actionCreator: (action) => action.type === 'auth/logout',
    effect: () => {
        if (wsService) {
            wsService.disconnect();
            wsService = null;
        }
    },
});

export default webSocketMiddleware.middleware;