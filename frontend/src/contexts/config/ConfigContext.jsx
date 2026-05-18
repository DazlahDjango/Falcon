import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { configWebSocketService } from '../../services/config';
import { getTenantId } from '../../services/accounts/storage/secureStorage';

const ConfigContext = createContext(null);

const initialState = {
  isInitialized: false,
  globalMaintenance: {
    active: false,
    type: null,
    message: null,
    affectedApps: [],
    startedAt: null,
    expectedEnd: null
  },
  activeBackups: new Map(),
  activeDRExecutions: new Map(),
  systemStatus: {
    celery: { workers: 0, available: false },
    storage: { type: 's3', available: true },
    database: { connected: true, latency: null }
  },
  permissions: {
    canAccessConfig: false,
    isSuperAdmin: false,
    isClientAdmin: false,
    canTriggerBackup: false,
    canScheduleMaintenance: false,
    canExecuteDR: false
  }
};

function configReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isInitialized: true };
    case 'SET_GLOBAL_MAINTENANCE':
      return {
        ...state,
        globalMaintenance: {
          active: action.payload.active,
          type: action.payload.maintenanceType,
          message: action.payload.message,
          affectedApps: action.payload.affectedApps || [],
          startedAt: action.payload.startedAt,
          expectedEnd: action.payload.expectedEnd
        }
      };
    case 'ADD_ACTIVE_BACKUP':
      state.activeBackups.set(action.payload.jobId, action.payload);
      return { ...state, activeBackups: new Map(state.activeBackups) };
    case 'UPDATE_ACTIVE_BACKUP':
      if (state.activeBackups.has(action.payload.jobId)) {
        const existing = state.activeBackups.get(action.payload.jobId);
        state.activeBackups.set(action.payload.jobId, { ...existing, ...action.payload });
      }
      return { ...state, activeBackups: new Map(state.activeBackups) };
    case 'REMOVE_ACTIVE_BACKUP':
      state.activeBackups.delete(action.payload);
      return { ...state, activeBackups: new Map(state.activeBackups) };
    case 'ADD_ACTIVE_DR':
      state.activeDRExecutions.set(action.payload.executionId, action.payload);
      return { ...state, activeDRExecutions: new Map(state.activeDRExecutions) };
    case 'UPDATE_ACTIVE_DR':
      if (state.activeDRExecutions.has(action.payload.executionId)) {
        const existing = state.activeDRExecutions.get(action.payload.executionId);
        state.activeDRExecutions.set(action.payload.executionId, { ...existing, ...action.payload });
      }
      return { ...state, activeDRExecutions: new Map(state.activeDRExecutions) };
    case 'REMOVE_ACTIVE_DR':
      state.activeDRExecutions.delete(action.payload);
      return { ...state, activeDRExecutions: new Map(state.activeDRExecutions) };
    case 'SET_SYSTEM_STATUS':
      return { ...state, systemStatus: { ...state.systemStatus, ...action.payload } };
    case 'SET_PERMISSIONS':
      return { ...state, permissions: { ...state.permissions, ...action.payload } };
    default:
      return state;
  }
}

export const ConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(configReducer, initialState);
  const reduxDispatch = useDispatch();
  const userRole = useSelector((state) => state.auth?.user?.role);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const updatePermissions = useCallback(() => {
    const isSuperAdmin = userRole === 'super_admin';
    const isClientAdmin = userRole === 'client_admin';
    dispatch({
      type: 'SET_PERMISSIONS',
      payload: {
        canAccessConfig: isSuperAdmin || isClientAdmin,
        isSuperAdmin,
        isClientAdmin,
        canTriggerBackup: isSuperAdmin || isClientAdmin,
        canScheduleMaintenance: isSuperAdmin || isClientAdmin,
        canExecuteDR: isSuperAdmin,
        canRotateKeys: isSuperAdmin,
        canModifyQuota: isSuperAdmin,
        canViewAuditLogs: isSuperAdmin
      }
    });
  }, [userRole]);

  const connectWebSockets = useCallback(async () => {
    if (!isAuthenticated) return;
    const tenantId = await getTenantId();
    if (!tenantId) return;

    configWebSocketService.connectMaintenance(tenantId, (data) => {
      dispatch({ type: 'SET_GLOBAL_MAINTENANCE', payload: data });
    });
  }, [isAuthenticated]);

  const disconnectWebSockets = useCallback(() => {
    configWebSocketService.disconnectAll();
  }, []);

  const addActiveBackup = useCallback((jobId, data) => {
    dispatch({ type: 'ADD_ACTIVE_BACKUP', payload: { jobId, ...data } });
    configWebSocketService.connectBackupProgress(jobId, (progress) => {
      dispatch({ type: 'UPDATE_ACTIVE_BACKUP', payload: { jobId, ...progress } });
      if (progress.status === 'completed' || progress.status === 'failed') {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_ACTIVE_BACKUP', payload: jobId });
        }, 5000);
      }
    });
  }, []);

  const addActiveDR = useCallback((executionId, data) => {
    dispatch({ type: 'ADD_ACTIVE_DR', payload: { executionId, ...data } });
    configWebSocketService.connectDRProgress(executionId, (progress) => {
      dispatch({ type: 'UPDATE_ACTIVE_DR', payload: { executionId, ...progress } });
      if (progress.status === 'success' || progress.status === 'failed') {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_ACTIVE_DR', payload: executionId });
        }, 5000);
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      updatePermissions();
      connectWebSockets();
    }
    return () => {
      disconnectWebSockets();
    };
  }, [isAuthenticated, updatePermissions, connectWebSockets, disconnectWebSockets]);

  const value = {
    ...state,
    updatePermissions,
    connectWebSockets,
    disconnectWebSockets,
    addActiveBackup,
    addActiveDR,
    getActiveBackup: (jobId) => state.activeBackups.get(jobId),
    getActiveDR: (executionId) => state.activeDRExecutions.get(executionId),
    isAppUnderMaintenance: (appName) => {
      if (!state.globalMaintenance.active) return false;
      if (state.globalMaintenance.type === 'full') return true;
      if (state.globalMaintenance.type === 'partial') {
        return state.globalMaintenance.affectedApps.includes(appName);
      }
      return false;
    }
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within ConfigProvider');
  }
  return context;
};