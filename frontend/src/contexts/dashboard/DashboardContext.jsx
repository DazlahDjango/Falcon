import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExecutiveDashboard,
  fetchClientAdminDashboard,
  fetchSuperAdminDashboard,
  setActiveDashboard,
  clearAllDashboards,
} from '../../store/dashboard/slices/dashboardSlice';
import { fetchManagerDashboard } from '../../store/dashboard/slices/managerDashboardSlice';
import { fetchStaffDashboard } from '../../store/dashboard/slices/staffDashboardSlice';
import { refreshChampionDashboard } from '../../store/dashboard/slices/championDashboardSlice';
import { fetchReadOnlyDashboard } from '../../store/dashboard/slices/readOnlyDashboardSlice';
import { DASHBOARD_TYPES } from '../../config/constants/dashboardConstants';

const DashboardContext = createContext(null);

const initialState = {
  activeDashboard: null,
  refreshInProgress: false,
  lastError: null,
  lastRefreshTime: null
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_DASHBOARD':
      return { ...state, activeDashboard: action.payload };
    case 'SET_REFRESH_IN_PROGRESS':
      return { ...state, refreshInProgress: action.payload };
    case 'SET_LAST_ERROR':
      return { ...state, lastError: action.payload };
    case 'SET_LAST_REFRESH_TIME':
      return { ...state, lastRefreshTime: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, lastError: null };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const reduxDispatch = useDispatch();
  const reduxState = useSelector((state) => state.dashboard);

  const setActiveDashboardType = useCallback((dashboardType) => {
    dispatch({ type: 'SET_ACTIVE_DASHBOARD', payload: dashboardType });
    reduxDispatch(setActiveDashboard(dashboardType));
  }, [reduxDispatch]);

  const refreshDashboard = useCallback(async () => {
    dispatch({ type: 'SET_REFRESH_IN_PROGRESS', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      switch (state.activeDashboard) {
        case DASHBOARD_TYPES.EXECUTIVE:
          await reduxDispatch(fetchExecutiveDashboard()).unwrap();
          break;
        case DASHBOARD_TYPES.CLIENT_ADMIN:
          await reduxDispatch(fetchClientAdminDashboard()).unwrap();
          break;
        case DASHBOARD_TYPES.SUPER_ADMIN:
          await reduxDispatch(fetchSuperAdminDashboard()).unwrap();
          break;
        case DASHBOARD_TYPES.MANAGER:
          await reduxDispatch(fetchManagerDashboard()).unwrap();
          break;
        case DASHBOARD_TYPES.STAFF:
          await reduxDispatch(fetchStaffDashboard()).unwrap();
          break;
        case DASHBOARD_TYPES.CHAMPION:
          await reduxDispatch(refreshChampionDashboard()).unwrap();
          break;
        case DASHBOARD_TYPES.READ_ONLY:
          await reduxDispatch(fetchReadOnlyDashboard()).unwrap();
          break;
        default:
          break;
      }
      
      dispatch({ type: 'SET_LAST_REFRESH_TIME', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({ type: 'SET_LAST_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_REFRESH_IN_PROGRESS', payload: false });
    }
  }, [state.activeDashboard, reduxDispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const resetDashboard = useCallback(() => {
    dispatch({ type: 'RESET' });
    reduxDispatch(clearAllDashboards());
  }, [reduxDispatch]);

  useEffect(() => {
    if (state.activeDashboard && reduxState?.refreshInProgress === false) {
      refreshDashboard();
    }
  }, [state.activeDashboard]);

  const value = {
    ...state,
    dashboardData: reduxState,
    setActiveDashboard: setActiveDashboardType,
    refreshDashboard,
    clearError,
    resetDashboard
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};