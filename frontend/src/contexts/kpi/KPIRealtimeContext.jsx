import React, {
    createContext, useContext, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import environment from '../../config/environment';
import { kpiWebSocket } from '../../services/websocket';
import { getAccessToken } from '../../services/accounts/storage/secureStorage';
import { validationService } from '../../services/kpi';
import { usePermissionContext } from '../accounts/PermissionContext';
import {
    setKpiWsConnected,
    setKpiBanner,
    setPendingValidationCount,
    setLatestScore,
    setLatestValidation,
    setLastRedAlert,
    bumpValidationRefresh,
} from '../../store/kpi/slice/kpiRealtimeSlice';

const KPIRealtimeContext = createContext(null);

export const useKPIRealtime = () => useContext(KPIRealtimeContext);

function wsBaseUrl() {
    const raw = environment.WS_URL || 'ws://localhost:8000/ws';
    return raw.replace(/\/ws\/?$/, '');
}

const SUPERVISOR_ROLES = ['supervisor', 'dashboard_champion', 'client_admin', 'executive', 'super_admin', 'manager'];

// Default state for when Redux state is undefined
const DEFAULT_REALTIME_STATE = {
    wsConnected: { 
        dashboard: false, 
        validation: false, 
        notifications: false,
        team: false,
        scores: false 
    },
    banner: null,
    pendingValidationCount: 0,
    latestScore: null,
    latestValidation: null,
    validationRefreshToken: 0,
    lastRedAlert: null
};

export const KPIRealtimeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, hasAnyRole } = usePermissionContext();
    const { isAuthenticated } = useSelector((state) => state.auth);
    
    // SAFE SELECTOR with fallback
    const realtime = useSelector((state) => {
        // Try multiple possible paths
        const realtimeState = state.kpi?.realtime || state.kpiRealtime;
        return realtimeState || DEFAULT_REALTIME_STATE;
    });
    
    const handlersRef = useRef({});

    const isKpiRoute = location.pathname.startsWith('/kpi') || 
                       location.pathname.startsWith('/dashboard') ||
                       location.pathname.startsWith('/validations') ||
                       location.pathname.startsWith('/scores');
    const isSupervisor = hasAnyRole(SUPERVISOR_ROLES);
    const userId = user?.id;
    const tenantId = user?.tenantId || user?.tenant_id;

    const loadPendingSummary = useCallback(async () => {
        if (!isSupervisor || !userId) return;
        try {
            const result = await validationService.getPendingSummary();
            const count = result?.pending_count ?? result?.data?.pending_count ?? 0;
            dispatch(setPendingValidationCount(count));
            if (count > 0) {
                dispatch(setKpiBanner({
                    type: 'warning',
                    title: 'Pending validations',
                    message: `${count} submission(s) await your review.`,
                    dismissible: true,
                    link: '/validations',
                }));
            }
        } catch (error) {
            console.error('Failed to load pending summary:', error);
        }
    }, [dispatch, isSupervisor, userId]);

    const handleDashboardMessage = useCallback((data) => {
        if (data.type === 'score_update' && data.data) {
            dispatch(setLatestScore(data.data));
        }
        if (data.type === 'team_update' && data.data) {
            dispatch(bumpValidationRefresh());
        }
        if (data.type === 'validation_update' && data.data) {
            dispatch(setLatestValidation(data.data));
            if (data.data.pending_count !== undefined) {
                dispatch(setPendingValidationCount(data.data.pending_count));
            }
        }
        if (data.type === 'notification' && data.data?.event === 'red_alert') {
            dispatch(setLastRedAlert(data.data));
            dispatch(setKpiBanner({
                type: 'error',
                title: 'KPI red alert',
                message: data.data.message || 'One or more KPIs are in sustained red status.',
                dismissible: true,
                link: '/scores/red-alerts',
            }));
        }
        if (data.type === 'initial' && data.data) {
            if (data.data.pending_validations !== undefined) {
                dispatch(setPendingValidationCount(data.data.pending_validations));
            }
        }
    }, [dispatch]);

    const handleValidationMessage = useCallback((data) => {
        if (data.type !== 'validation_update' || !data.data) return;
        dispatch(setLatestValidation(data.data));
        if (data.data.pending_count !== undefined) {
            dispatch(setPendingValidationCount(data.data.pending_count));
            if (data.data.pending_count > 0) {
                dispatch(setKpiBanner({
                    type: 'warning',
                    title: 'Validation queue updated',
                    message: `${data.data.pending_count} pending submission(s).`,
                    dismissible: true,
                    link: '/validations',
                }));
            }
        } else {
            dispatch(bumpValidationRefresh());
        }
    }, [dispatch]);

    const handleNotificationMessage = useCallback((data) => {
        if (data.type === 'notification' && data.data?.event === 'red_alert') {
            dispatch(setLastRedAlert(data.data));
            dispatch(setKpiBanner({
                type: 'error',
                title: 'KPI red alert',
                message: data.data.message || 'Organization KPI health alert.',
                dismissible: true,
                link: '/scores/red-alerts',
            }));
        }
        if (data.type === 'notification' && data.data?.event === 'kpi_changed') {
            dispatch(setKpiBanner({
                type: 'info',
                title: 'KPI definition updated',
                message: `KPI ${data.data.kpi_id || ''} was ${data.data.action || 'updated'}.`,
                dismissible: true,
                link: `/kpis/${data.data.kpi_id}`,
            }));
        }
        if (data.type === 'organization_health_update' && data.data) {
            if (data.data.red_kpi_count > 0) {
                dispatch(setKpiBanner({
                    type: 'error',
                    title: 'Health Alert',
                    message: `${data.data.red_kpi_count} KPIs are in red status.`,
                    dismissible: true,
                }));
            }
        }
    }, [dispatch]);

    const handleTeamMessage = useCallback((data) => {
        if (data.type === 'team_update' && data.data) {
            dispatch(bumpValidationRefresh());
            if (data.data.pending_validations !== undefined) {
                dispatch(setPendingValidationCount(data.data.pending_validations));
            }
        }
        if (data.type === 'member_score_update' && data.data) {
            dispatch(setLatestScore(data.data));
        }
    }, [dispatch]);

    useEffect(() => {
        if (!isAuthenticated || !userId || !isKpiRoute) {
            kpiWebSocket.disconnectAll();
            dispatch(setKpiWsConnected({ 
                dashboard: false, 
                validation: false, 
                notifications: false,
                team: false,
                scores: false 
            }));
            return undefined;
        }

        let cancelled = false;

        const connect = async () => {
            const token = await getAccessToken();
            if (!token || cancelled) return;
            kpiWebSocket.init(wsBaseUrl(), token);

            // Dashboard connection
            kpiWebSocket.connectDashboard(userId, handleDashboardMessage, () => {
                if (!cancelled) dispatch(setKpiWsConnected({ dashboard: true }));
            });

            // Scores connection
            kpiWebSocket.connectScores(userId, (data) => {
                if (data.type === 'score_update' && data.data) {
                    dispatch(setLatestScore(data.data));
                }
            }, () => {
                if (!cancelled) dispatch(setKpiWsConnected({ scores: true }));
            });

            // Validation connection for supervisors
            if (isSupervisor) {
                kpiWebSocket.connectValidation(userId, handleValidationMessage, () => {
                    if (!cancelled) dispatch(setKpiWsConnected({ validation: true }));
                });
                loadPendingSummary();
            }

            // Team connection for managers
            if (hasAnyRole(['manager', 'supervisor'])) {
                kpiWebSocket.connectTeamDashboard(userId, handleTeamMessage, () => {
                    if (!cancelled) dispatch(setKpiWsConnected({ team: true }));
                });
            }

            // Executive/Notification connection
            if (hasAnyRole(['executive', 'super_admin', 'client_admin']) && tenantId) {
                kpiWebSocket.connectExecutiveDashboard(tenantId, handleNotificationMessage, () => {
                    if (!cancelled) dispatch(setKpiWsConnected({ notifications: true }));
                });
            } else {
                kpiWebSocket.connectNotifications(userId, handleNotificationMessage, () => {
                    if (!cancelled) dispatch(setKpiWsConnected({ notifications: true }));
                });
            }
        };

        connect();

        return () => {
            cancelled = true;
            kpiWebSocket.disconnectDashboard(userId);
            kpiWebSocket.disconnectValidation(userId);
            kpiWebSocket.disconnectNotifications(userId);
            kpiWebSocket.disconnectScores(userId);
            kpiWebSocket.disconnectTeamDashboard(userId);
            if (tenantId) kpiWebSocket.disconnectExecutiveDashboard(tenantId);
            dispatch(setKpiWsConnected({ 
                dashboard: false, 
                validation: false, 
                notifications: false,
                team: false,
                scores: false 
            }));
        };
    }, [
        isAuthenticated,
        userId,
        tenantId,
        isKpiRoute,
        isSupervisor,
        hasAnyRole,
        dispatch,
        handleDashboardMessage,
        handleValidationMessage,
        handleNotificationMessage,
        handleTeamMessage,
        loadPendingSummary,
    ]);

    // SAFELY compute value with fallback for wsConnected
    const wsConnected = realtime?.wsConnected || DEFAULT_REALTIME_STATE.wsConnected;
    
    const value = useMemo(() => ({
        ...realtime,
        wsConnected,
        isConnected: Object.values(wsConnected).some(Boolean),
        refreshPendingSummary: loadPendingSummary,
        sendRefresh: (dashboardType) => {
            kpiWebSocket.refreshDashboard(userId, dashboardType);
        },
        subscribeTo: (subscription) => {
            kpiWebSocket.subscribe(userId, 'dashboard', subscription);
        },
    }), [realtime, wsConnected, loadPendingSummary, userId]);

    return (
        <KPIRealtimeContext.Provider value={value}>
            {children}
        </KPIRealtimeContext.Provider>
    );
};

export default KPIRealtimeProvider;