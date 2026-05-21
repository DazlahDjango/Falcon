import React, {
    createContext, useContext, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import environment from '../../config/environment';
import { kpiWebSocket } from '../../services/websocket';
import { getAccessToken } from '../../services/accounts/storage/secureStorage';
import { getPendingValidationSummary } from '../../services/kpi/settings.service';
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

const SUPERVISOR_ROLES = ['supervisor', 'dashboard_champion', 'client_admin', 'executive', 'super_admin'];

export const KPIRealtimeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, hasAnyRole } = usePermissionContext();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const realtime = useSelector((state) => state.kpiRealtime);
    const handlersRef = useRef({});

    const isKpiRoute = location.pathname.startsWith('/kpi');
    const isSupervisor = hasAnyRole(SUPERVISOR_ROLES);
    const userId = user?.id;
    const tenantId = user?.tenantId || user?.tenant_id;

    const loadPendingSummary = useCallback(async () => {
        if (!isSupervisor || !userId) return;
        try {
            const res = await getPendingValidationSummary();
            const count = res.data?.pending_count ?? 0;
            dispatch(setPendingValidationCount(count));
            if (count > 0) {
                dispatch(setKpiBanner({
                    type: 'warning',
                    title: 'Pending validations',
                    message: `${count} submission(s) await your review.`,
                    dismissible: true,
                    link: '/kpi/validation',
                }));
            }
        } catch {
            /* non-fatal */
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
            }));
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
                    link: '/kpi/validation',
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
            }));
        }
        if (data.type === 'notification' && data.data?.event === 'kpi_changed') {
            dispatch(setKpiBanner({
                type: 'info',
                title: 'KPI definition updated',
                message: `KPI ${data.data.kpi_id || ''} was ${data.data.action || 'updated'}.`,
                dismissible: true,
            }));
        }
    }, [dispatch]);

    useEffect(() => {
        if (!isAuthenticated || !userId || !isKpiRoute) {
            kpiWebSocket.disconnectAll();
            dispatch(setKpiWsConnected({ dashboard: false, validation: false, notifications: false }));
            return undefined;
        }

        let cancelled = false;

        const connect = async () => {
            const token = await getAccessToken();
            if (!token || cancelled) return;
            kpiWebSocket.init(wsBaseUrl(), token);

            kpiWebSocket.connectDashboard(userId, handleDashboardMessage, () => {
                if (!cancelled) dispatch(setKpiWsConnected({ dashboard: true }));
            });

            if (isSupervisor) {
                kpiWebSocket.connectValidation(userId, handleValidationMessage, () => {
                    if (!cancelled) dispatch(setKpiWsConnected({ validation: true }));
                });
                loadPendingSummary();
            }

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
            if (tenantId) kpiWebSocket.disconnectExecutiveDashboard(tenantId);
            dispatch(setKpiWsConnected({ dashboard: false, validation: false, notifications: false }));
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
        loadPendingSummary,
    ]);

    const value = useMemo(() => ({
        ...realtime,
        isConnected: Object.values(realtime.wsConnected).some(Boolean),
        refreshPendingSummary: loadPendingSummary,
    }), [realtime, loadPendingSummary]);

    return (
        <KPIRealtimeContext.Provider value={value}>
            {children}
        </KPIRealtimeContext.Provider>
    );
};
