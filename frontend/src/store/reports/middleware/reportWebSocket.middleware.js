import reportsWebSocketService from '../../../services/reports/websocket.service';
import { showAlert } from '../../accounts/slice/uiSlice';

export const reportWebSocketMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type === 'reports/initializeDashboardWebSocket' && action.payload?.dashboardId) {
        reportsWebSocketService.connectDashboard(action.payload.dashboardId, (data) => {
            store.dispatch({ type: 'reports/dashboardWsUpdate', payload: data });
        }).catch(err => console.error('[ReportsWSMiddleware] Error:', err));
    }

    if (action.type === 'reports/initializeStatusWebSocket' && action.payload?.reportId) {
        reportsWebSocketService.connectReportStatus(action.payload.reportId, (data) => {
            store.dispatch({ type: 'reports/statusWsUpdate', payload: data });
            if (data?.progress === 100 || data?.status === 'completed') {
                store.dispatch(showAlert({ type: 'success', message: 'Report generation completed!' }));
            }
        }).catch(err => console.error('[ReportsWSMiddleware] Error:', err));
    }

    if (action.type === 'reports/initializeNotificationsWebSocket') {
        reportsWebSocketService.connectNotifications((data) => {
            store.dispatch({ type: 'reports/notificationReceived', payload: data });
            if (data?.data?.verb || data?.data?.description) {
                store.dispatch(showAlert({ type: 'info', message: `${data.data.verb}: ${data.data.description}` }));
            }
        }).catch(err => console.error('[ReportsWSMiddleware] Error:', err));
    }

    if (action.type === 'reports/closeWebSockets') {
        reportsWebSocketService.disconnectAll();
    }

    return result;
};

// Helper Action Creators & Functions for backwards compatibility
export const connectWebSocket = (channel, params = {}) => (dispatch) => {
    if (channel === 'dashboard' && params.dashboardId) {
        dispatch({ type: 'reports/initializeDashboardWebSocket', payload: params });
    } else if (channel === 'report_status' && params.reportId) {
        dispatch({ type: 'reports/initializeStatusWebSocket', payload: params });
    } else {
        dispatch({ type: 'reports/initializeNotificationsWebSocket', payload: params });
    }
};

export const disconnectWebSocket = (channel) => (dispatch) => {
    dispatch({ type: 'reports/closeWebSockets' });
};

export const disconnectAllWebSockets = () => (dispatch) => {
    dispatch({ type: 'reports/closeWebSockets' });
};

export const reconnectWebSocket = (channel, params) => (dispatch) => {
    dispatch(disconnectWebSocket(channel));
    setTimeout(() => dispatch(connectWebSocket(channel, params)), 1000);
};

export const getWebSocketStatus = (channel) => {
    return reportsWebSocketService.isConnected(channel) ? 'connected' : 'disconnected';
};

export const isWebSocketConnected = (channel) => {
    return reportsWebSocketService.isConnected(channel);
};

export const sendWebSocketMessage = (channel, data) => {
    return reportsWebSocketService.send(channel, data);
};

export const getWebSocketUrl = (channel) => channel;
export const handleMessage = (data) => data;
export const handleDashboardMessage = (data) => data;
export const handleReportStatusMessage = (data) => data;
export const handleNotificationMessage = (data) => data;
export const handleReportProgressMessage = (data) => data;

export default reportWebSocketMiddleware;