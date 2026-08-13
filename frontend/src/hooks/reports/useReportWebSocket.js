import { useEffect, useCallback, useState } from 'react';
import reportsWebSocketService from '../../services/reports/websocket.service';

export const useReportWebSocket = (channel, options = {}) => {
    const {
        autoConnect = true,
        reportId = null,
        dashboardId = null,
        onMessage = null,
        onError = null,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);

    const connect = useCallback(() => {
        const handleMsg = (data) => {
            setLastMessage(data);
            if (onMessage) onMessage(data);
        };

        if (channel === 'dashboard' && dashboardId) {
            reportsWebSocketService.connectDashboard(dashboardId, handleMsg, onError).then(() => {
                setIsConnected(true);
            });
        } else if (channel === 'report_status' && reportId) {
            reportsWebSocketService.connectReportStatus(reportId, handleMsg, onError).then(() => {
                setIsConnected(true);
            });
        } else if (channel === 'notifications') {
            reportsWebSocketService.connectNotifications(handleMsg, onError).then(() => {
                setIsConnected(true);
            });
        }
    }, [channel, reportId, dashboardId, onMessage, onError]);

    const disconnect = useCallback(() => {
        if (channel === 'dashboard' && dashboardId) {
            reportsWebSocketService.disconnectDashboard(dashboardId);
        } else if (channel === 'report_status' && reportId) {
            reportsWebSocketService.disconnectReportStatus(reportId);
        } else if (channel === 'notifications') {
            reportsWebSocketService.disconnectNotifications();
        }
        setIsConnected(false);
    }, [channel, reportId, dashboardId]);

    const send = useCallback((message) => {
        const key = channel === 'dashboard' ? `reportplt_dashboard_${dashboardId}` : channel === 'report_status' ? `reportplt_status_${reportId}` : 'reportplt_notifications';
        return reportsWebSocketService.send(key, message);
    }, [channel, reportId, dashboardId]);

    useEffect(() => {
        if (autoConnect && channel) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, channel, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        connect,
        disconnect,
        send
    };
};

export default useReportWebSocket;