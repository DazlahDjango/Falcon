import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { maintenanceService } from '../../services/config';

const MaintenanceContext = createContext(null);

const initialState = {
  windows: [],
  activeWindows: [],
  upcomingWindows: [],
  logs: [],
  stats: null,
  filters: { page: 1, limit: 20, status: '', maintenance_type: '' },
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  selectedWindow: null
};

function maintenanceReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_WINDOWS':
      return { ...state, windows: action.payload, loading: false };
    case 'SET_ACTIVE_WINDOWS':
      return { ...state, activeWindows: action.payload };
    case 'SET_UPCOMING_WINDOWS':
      return { ...state, upcomingWindows: action.payload };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'SET_SELECTED_WINDOW':
      return { ...state, selectedWindow: action.payload };
    case 'ADD_WINDOW':
      return { ...state, windows: [action.payload, ...state.windows] };
    case 'UPDATE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => w.id === action.payload.id ? { ...w, ...action.payload } : w),
        selectedWindow: state.selectedWindow?.id === action.payload.id ? { ...state.selectedWindow, ...action.payload } : state.selectedWindow,
        activeWindows: action.payload.status === 'in_progress'
          ? [...state.activeWindows.filter(w => w.id !== action.payload.id), action.payload]
          : state.activeWindows.filter(w => w.id !== action.payload.id)
      };
    case 'REMOVE_WINDOW':
      return { ...state, windows: state.windows.filter(w => w.id !== action.payload) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const MaintenanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(maintenanceReducer, initialState);

  const fetchWindows = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await maintenanceService.list(state.filters);
      const windows = response.data?.results || [];
      dispatch({ type: 'SET_WINDOWS', payload: windows });
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          total: response.data?.count || 0,
          pages: Math.ceil((response.data?.count || 0) / state.filters.limit),
          page: state.filters.page,
          limit: state.filters.limit
        }
      });
      
      const active = windows.filter(w => w.status === 'in_progress');
      const upcoming = windows.filter(w => w.status === 'scheduled');
      dispatch({ type: 'SET_ACTIVE_WINDOWS', payload: active });
      dispatch({ type: 'SET_UPCOMING_WINDOWS', payload: upcoming });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.filters]);

  const fetchLogs = useCallback(async (windowId = null) => {
    try {
      const params = windowId ? { maintenance_window_id: windowId } : {};
      const response = await maintenanceService.getLogs(params);
      dispatch({ type: 'SET_LOGS', payload: response.data?.results || [] });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await maintenanceService.getMaintenanceStats();
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const scheduleMaintenance = useCallback(async (data) => {
    try {
      const response = await maintenanceService.scheduleMaintenance(
        data.title,
        data.maintenance_type,
        data.scheduled_start,
        data.scheduled_end,
        data.reason,
        data.affected_apps
      );
      const newWindow = response.data;
      dispatch({ type: 'ADD_WINDOW', payload: newWindow });
      return newWindow;
    } catch (error) {
      console.error('Failed to schedule maintenance:', error);
      throw error;
    }
  }, []);

  const startMaintenance = useCallback(async (windowId) => {
    try {
      await maintenanceService.startMaintenance(windowId);
      dispatch({ type: 'UPDATE_WINDOW', payload: { id: windowId, status: 'in_progress' } });
    } catch (error) {
      console.error('Failed to start maintenance:', error);
      throw error;
    }
  }, []);

  const stopMaintenance = useCallback(async (windowId) => {
    try {
      await maintenanceService.stopMaintenance(windowId);
      dispatch({ type: 'UPDATE_WINDOW', payload: { id: windowId, status: 'completed' } });
    } catch (error) {
      console.error('Failed to stop maintenance:', error);
      throw error;
    }
  }, []);

  const cancelMaintenance = useCallback(async (windowId) => {
    try {
      await maintenanceService.cancelMaintenance(windowId);
      dispatch({ type: 'UPDATE_WINDOW', payload: { id: windowId, status: 'cancelled' } });
    } catch (error) {
      console.error('Failed to cancel maintenance:', error);
      throw error;
    }
  }, []);

  const updateFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const selectWindow = useCallback((window) => {
    dispatch({ type: 'SET_SELECTED_WINDOW', payload: window });
  }, []);

  const refresh = useCallback(() => {
    fetchWindows();
    fetchLogs();
    fetchStats();
  }, [fetchWindows, fetchLogs, fetchStats]);

  const value = {
    ...state,
    fetchWindows,
    fetchLogs,
    fetchStats,
    scheduleMaintenance,
    startMaintenance,
    stopMaintenance,
    cancelMaintenance,
    updateFilters,
    selectWindow,
    refresh
  };

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};

export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within MaintenanceProvider');
  }
  return context;
};