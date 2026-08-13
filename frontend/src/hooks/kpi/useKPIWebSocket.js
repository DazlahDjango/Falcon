import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import kpiWebSocket from '../../services/websocket/kpi.websocket';

export const useKPIWebSocket = (userId, connectionTypes = []) => {
    const dispatch = useDispatch();

    const connect = useCallback(() => {
        if (!userId) return;

        if (connectionTypes.includes('dashboard')) {
            kpiWebSocket.connectDashboard(userId, (message) => {
                dispatch({ type: 'kpi/dashboardUpdated', payload: message.data || message });
            });
        }

        if (connectionTypes.includes('scores')) {
            kpiWebSocket.connectScores(userId, (message) => {
                dispatch({ type: 'score/scoreUpdated', payload: message.data || message });
            });
        }

        if (connectionTypes.includes('notifications')) {
            kpiWebSocket.connectNotifications(userId, (message) => {
                dispatch({ type: 'kpi/notificationReceived', payload: message.data || message });
            });
        }
    }, [userId, connectionTypes, dispatch]);

    const disconnect = useCallback(() => {
        if (!userId) return;
        kpiWebSocket.disconnectDashboard(userId);
        kpiWebSocket.disconnectScores(userId);
        kpiWebSocket.disconnectNotifications(userId);
    }, [userId]);

    useEffect(() => {
        if (userId) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [userId, connect, disconnect]);

    return {
        connect,
        disconnect
    };
};

export default useKPIWebSocket;