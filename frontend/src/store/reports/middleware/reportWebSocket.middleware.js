// ============================================
// apps/reportplt/middleware/reportWebSocket.middleware.js
// ============================================

import { REPORT_WS } from '../../../config/constants/reportApiConstants';

let wsConnections = {};
let wsReconnectAttempts = {};
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export const reportWebSocketMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type === 'websocket/connect') {
        const { channel, params = {} } = action.payload || {};
        if (channel) {
            connectWebSocket(channel, params, store);
        }
    }

    if (action.type === 'websocket/disconnect') {
        const { channel } = action.payload || {};
        if (channel) {
            disconnectWebSocket(channel);
        } else {
            disconnectAllWebSockets();
        }
    }

    if (action.type === 'websocket/reconnect') {
        const { channel, params = {} } = action.payload || {};
        if (channel) {
            reconnectWebSocket(channel, params, store);
        }
    }

    if (action.type === 'websocket/send') {
        const { channel, data } = action.payload || {};
        if (channel && wsConnections[channel]?.readyState === WebSocket.OPEN) {
            wsConnections[channel].send(JSON.stringify(data));
        }
    }

    return result;
};

export const connectWebSocket = (channel, params, store) => {
    if (wsConnections[channel]?.readyState === WebSocket.OPEN) return;

    let wsUrl = getWebSocketUrl(channel, params);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log(`WebSocket connected: ${channel}`);
        wsReconnectAttempts[channel] = 0;
        store.dispatch({
            type: 'websocket/connected',
            payload: { channel, status: 'connected' },
        });
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            store.dispatch({
                type: 'websocket/message',
                payload: { channel, data },
            });
            handleMessage(data, channel, store);
        } catch (error) {
            console.error('WebSocket message parsing error:', error);
        }
    };

    ws.onerror = (error) => {
        console.error(`WebSocket error (${channel}):`, error);
        store.dispatch({
            type: 'websocket/error',
            payload: { channel, error: error.message || 'WebSocket error' },
        });
    };

    ws.onclose = () => {
        console.log(`WebSocket closed: ${channel}`);
        store.dispatch({
            type: 'websocket/disconnected',
            payload: { channel, status: 'disconnected' },
        });
        handleReconnect(channel, params, store);
    };

    wsConnections[channel] = ws;
};

export const disconnectWebSocket = (channel) => {
    if (wsConnections[channel]) {
        wsConnections[channel].close();
        delete wsConnections[channel];
        delete wsReconnectAttempts[channel];
    }
};

export const disconnectAllWebSockets = () => {
    Object.keys(wsConnections).forEach((channel) => {
        disconnectWebSocket(channel);
    });
};

export const reconnectWebSocket = (channel, params, store) => {
    disconnectWebSocket(channel);
    wsReconnectAttempts[channel] = 0;
    connectWebSocket(channel, params, store);
};

export const handleReconnect = (channel, params, store) => {
    if (!wsReconnectAttempts[channel]) wsReconnectAttempts[channel] = 0;
    wsReconnectAttempts[channel] += 1;

    if (wsReconnectAttempts[channel] <= MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
            if (wsConnections[channel]?.readyState !== WebSocket.OPEN) {
                connectWebSocket(channel, params, store);
            }
        }, RECONNECT_DELAY * wsReconnectAttempts[channel]);
    } else {
        console.warn(`Max reconnect attempts reached for channel: ${channel}`);
        store.dispatch({
            type: 'websocket/reconnect_failed',
            payload: { channel, attempts: wsReconnectAttempts[channel] },
        });
    }
};

export const getWebSocketUrl = (channel, params) => {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    const urlMap = {
        dashboard: `${baseUrl}/dashboard/${params.dashboardId || ''}/`,
        report_status: `${baseUrl}/report/${params.reportId || ''}/status/`,
        notifications: `${baseUrl}/notifications/`,
        report_progress: `${baseUrl}/report/${params.reportId || ''}/progress/`,
    };
    return urlMap[channel] || `${baseUrl}/${channel}/`;
};

export const handleMessage = (data, channel, store) => {
    switch (channel) {
        case 'dashboard':
            handleDashboardMessage(data, store);
            break;
        case 'report_status':
            handleReportStatusMessage(data, store);
            break;
        case 'notifications':
            handleNotificationMessage(data, store);
            break;
        case 'report_progress':
            handleReportProgressMessage(data, store);
            break;
        default:
            break;
    }
};

export const handleDashboardMessage = (data, store) => {
    if (data.type === 'dashboard_update') {
        store.dispatch({
            type: 'dashboard/updateDashboard',
            payload: data.data,
        });
    }
    if (data.type === 'widget_update') {
        store.dispatch({
            type: 'widget/updateWidget',
            payload: data.data,
        });
    }
    if (data.type === 'dashboard_alert') {
        store.dispatch({
            type: 'ui/setNotification',
            payload: { message: data.message, type: data.alert_type || 'info' },
        });
    }
};

export const handleReportStatusMessage = (data, store) => {
    if (data.type === 'report_status') {
        store.dispatch({
            type: 'report/updateStatus',
            payload: { id: data.report_id, status: data.status, progress: data.progress },
        });
    }
    if (data.type === 'generation_completed') {
        store.dispatch({
            type: 'report/generationComplete',
            payload: { id: data.report_id, result: data.result },
        });
    }
    if (data.type === 'generation_failed') {
        store.dispatch({
            type: 'report/generationFailed',
            payload: { id: data.report_id, error: data.error },
        });
    }
    if (data.type === 'generation_cancelled') {
        store.dispatch({
            type: 'report/generationCancelled',
            payload: { id: data.report_id },
        });
    }
};

export const handleNotificationMessage = (data, store) => {
    if (data.type === 'notification') {
        store.dispatch({
            type: 'ui/addNotification',
            payload: {
                id: data.id || Date.now(),
                message: data.message,
                type: data.notification_type || 'info',
                data: data.data,
            },
        });
        if (data.unread_count !== undefined) {
            store.dispatch({
                type: 'ui/setUnreadCount',
                payload: data.unread_count,
            });
        }
    }
};

export const handleReportProgressMessage = (data, store) => {
    if (data.type === 'progress') {
        store.dispatch({
            type: 'report/updateGenerationProgress',
            payload: { id: data.report_id, progress: data.progress, status: data.status },
        });
    }
};

export const getWebSocketStatus = (channel) => {
    if (!wsConnections[channel]) return 'disconnected';
    const statusMap = {
        [WebSocket.CONNECTING]: 'connecting',
        [WebSocket.OPEN]: 'connected',
        [WebSocket.CLOSING]: 'closing',
        [WebSocket.CLOSED]: 'disconnected',
    };
    return statusMap[wsConnections[channel].readyState] || 'unknown';
};

export const isWebSocketConnected = (channel) => {
    return wsConnections[channel]?.readyState === WebSocket.OPEN;
};

export const sendWebSocketMessage = (channel, data) => {
    if (wsConnections[channel]?.readyState === WebSocket.OPEN) {
        wsConnections[channel].send(JSON.stringify(data));
        return true;
    }
    return false;
};