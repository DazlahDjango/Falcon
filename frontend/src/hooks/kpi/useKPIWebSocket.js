import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import kpiWebSocket from '../../services/websocket/kpi.websocket';
import {
    fetchIndividualDashboard,
    fetchManagerDashboard,
    fetchExecutiveDashboard,
    fetchRedAlerts,
    fetchMyScores,
    fetchPendingValidations,
} from '../../store/kpi';

const useKPIWebSocket = (userId, connectionTypes = []) => {
    const dispatch = useDispatch();
    const subscriptions = useRef(new Map());
    
    const handleScoreUpdate = useCallback((data) => {
        // Refresh relevant data when scores update
        if (connectionTypes.includes('scores')) {
            dispatch(fetchMyScores());
        }
        if (connectionTypes.includes('dashboard')) {
            dispatch(fetchIndividualDashboard());
        }
        if (connectionTypes.includes('red_alerts')) {
            dispatch(fetchRedAlerts());
        }
    }, [dispatch, connectionTypes]);
    
    const handleValidationUpdate = useCallback((data) => {
        if (connectionTypes.includes('validations')) {
            dispatch(fetchPendingValidations());
        }
        if (connectionTypes.includes('manager_dashboard')) {
            dispatch(fetchManagerDashboard());
        }
    }, [dispatch, connectionTypes]);
    
    const handleTeamUpdate = useCallback((data) => {
        if (connectionTypes.includes('team')) {
            dispatch(fetchManagerDashboard());
        }
    }, [dispatch, connectionTypes]);
    
    const handleOrganizationHealthUpdate = useCallback((data) => {
        if (connectionTypes.includes('executive')) {
            dispatch(fetchExecutiveDashboard());
        }
    }, [dispatch, connectionTypes]);
    
    const handleRedAlert = useCallback((data) => {
        if (connectionTypes.includes('red_alerts')) {
            dispatch(fetchRedAlerts());
        }
    }, [dispatch, connectionTypes]);
    
    const messageHandlers = {
        score_update: handleScoreUpdate,
        validation_update: handleValidationUpdate,
        team_update: handleTeamUpdate,
        organization_health_update: handleOrganizationHealthUpdate,
        red_alert: handleRedAlert,
    };
    
    const connect = useCallback(() => {
        // Connect to individual dashboard
        if (connectionTypes.includes('dashboard') && userId) {
            kpiWebSocket.connectDashboard(userId, (message) => {
                const handler = messageHandlers[message.type];
                if (handler) handler(message.data);
            });
        }
        
        // Connect to scores
        if (connectionTypes.includes('scores') && userId) {
            kpiWebSocket.connectScores(userId, (message) => {
                if (message.type === 'score_update') {
                    handleScoreUpdate(message.data);
                }
            });
        }
        
        // Connect to validations
        if (connectionTypes.includes('validations') && userId) {
            kpiWebSocket.connectValidation(userId, (message) => {
                if (message.type === 'validation_update') {
                    handleValidationUpdate(message.data);
                }
            });
        }
        
        // Connect to notifications
        if (connectionTypes.includes('notifications') && userId) {
            kpiWebSocket.connectNotifications(userId, (message) => {
                if (message.type === 'notification') {
                    // Handle notification - could dispatch to UI
                    console.log('Notification:', message.data);
                }
            });
        }
    }, [userId, connectionTypes, handleScoreUpdate, handleValidationUpdate]);
    
    const disconnect = useCallback(() => {
        if (connectionTypes.includes('dashboard') && userId) {
            kpiWebSocket.disconnectDashboard(userId);
        }
        if (connectionTypes.includes('scores') && userId) {
            kpiWebSocket.disconnectScores(userId);
        }
        if (connectionTypes.includes('validations') && userId) {
            kpiWebSocket.disconnectValidation(userId);
        }
        if (connectionTypes.includes('notifications') && userId) {
            kpiWebSocket.disconnectNotifications(userId);
        }
    }, [userId, connectionTypes]);
    
    const refreshDashboard = useCallback(() => {
        if (connectionTypes.includes('dashboard') && userId) {
            kpiWebSocket.refreshDashboard(userId, 'dashboard');
        }
    }, [userId, connectionTypes]);
    
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);
    
    return {
        refreshDashboard,
        isConnected: {
            dashboard: connectionTypes.includes('dashboard') && kpiWebSocket.connections.dashboard !== null,
            scores: connectionTypes.includes('scores') && kpiWebSocket.connections.scores !== null,
            validations: connectionTypes.includes('validations') && kpiWebSocket.connections.validation !== null,
        },
    };
};

export default useKPIWebSocket;