import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dashboardWebSocket } from '../../services/dashboard/websocket.service';
import { useDashboardProfileContext } from './DashboardProfileContext';
import {
  updateExecutiveData,
  updateClientAdminData,
  updateSuperAdminData,
} from '../../store/dashboard/slices/dashboardSlice';
import { updateManagerData } from '../../store/dashboard/slices/managerDashboardSlice';
import { updateStaffData } from '../../store/dashboard/slices/staffDashboardSlice';
import { updateChampionData } from '../../store/dashboard/slices/championDashboardSlice';
import { updateReadOnlyData } from '../../store/dashboard/slices/readOnlyDashboardSlice';

const DashboardRealtimeContext = createContext(null);

const dispatchDashboardPayload = (dispatch, dashboardType, data) => {
  switch (dashboardType) {
    case 'executive':
      dispatch(updateExecutiveData(data));
      break;
    case 'client_admin':
      dispatch(updateClientAdminData(data));
      break;
    case 'super_admin':
      dispatch(updateSuperAdminData(data));
      break;
    case 'manager':
      dispatch(updateManagerData(data));
      break;
    case 'staff':
      dispatch(updateStaffData(data));
      break;
    case 'champion':
      dispatch(updateChampionData(data));
      break;
    case 'read_only':
      dispatch(updateReadOnlyData(data));
      break;
    default:
      break;
  }
};

export const DashboardRealtimeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { dashboardRole } = useDashboardProfileContext();
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const handlersRef = useRef({});

  /** Stay connected for platform admins on config/billing/tenant routes (RoleBasedAppLayout). */
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard')
    || location.pathname.startsWith('/config')
    || location.pathname.startsWith('/billing')
    || location.pathname.startsWith('/tenants');
  
  // Ensure dashboardRole is a valid string
  const validDashboardRole = (typeof dashboardRole === 'string' && dashboardRole) ? dashboardRole : null;
  const activeType = validDashboardRole || 'staff';
  
  if (dashboardRole && typeof dashboardRole !== 'string') {
    console.warn('[DashboardRealtimeContext] dashboardRole is not a string:', typeof dashboardRole, dashboardRole);
  }

  const handleMessage = useCallback((message) => {
    setLastEvent(message);
    if (message?.type === 'initial' || message?.type === 'update') {
      if (message.data) {
        dispatchDashboardPayload(dispatch, activeType, message.data);
      }
    }
    const extra = handlersRef.current[activeType];
    if (extra) extra(message);
  }, [dispatch, activeType]);

  const handleError = useCallback((err) => {
    setConnected(false);
    console.warn('[Dashboard WS]', err?.message || err);
  }, []);

  useEffect(() => {
    if (!dashboardRole) {
      dashboardWebSocket.disconnect();
      setConnected(false);
      return undefined;
    }

    dashboardWebSocket.connect(activeType, handleMessage, handleError);
    setConnected(dashboardWebSocket.isConnected());

    const interval = setInterval(() => {
      setConnected(dashboardWebSocket.isConnected());
    }, 5000);

    return () => {
      clearInterval(interval);
      dashboardWebSocket.disconnect();
      setConnected(false);
    };
  }, [dashboardRole, activeType, handleMessage, handleError]);

  const refresh = useCallback(() => {
    dashboardWebSocket.refresh();
  }, []);

  const registerHandler = useCallback((type, fn) => {
    handlersRef.current[type] = fn;
    return () => {
      if (handlersRef.current[type] === fn) {
        delete handlersRef.current[type];
      }
    };
  }, []);

  const value = useMemo(() => ({
    connected,
    lastEvent,
    dashboardType: activeType,
    refresh,
    registerHandler,
  }), [connected, lastEvent, activeType, refresh, registerHandler]);

  return (
    <DashboardRealtimeContext.Provider value={value}>
      {children}
    </DashboardRealtimeContext.Provider>
  );
};

export const useDashboardRealtime = () => {
  const ctx = useContext(DashboardRealtimeContext);
  if (!ctx) {
    return {
      connected: false,
      lastEvent: null,
      dashboardType: null,
      refresh: () => {},
      registerHandler: () => () => {},
    };
  }
  return ctx;
};

export default DashboardRealtimeContext;
