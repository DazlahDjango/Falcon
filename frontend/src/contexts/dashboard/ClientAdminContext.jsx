import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClientAdminDashboard,
  fetchClientAdminCompliance,
  fetchClientAdminPendingApprovals,
  fetchClientAdminMissingData,
  fetchClientAdminUserActivity,
  fetchClientAdminKpiBreakdown,
  updateClientAdminData
} from '../../store/dashboard/slices/dashboardSlice';
import { useDashboard } from './DashboardContext';

const ClientAdminContext = createContext(null);

const initialState = {
  compliance: null,
  pendingApprovals: [],
  missingData: [],
  userActivity: null,
  kpiBreakdown: null,
  selectedUser: null,
  dateRange: { start: null, end: null },
  filters: { status: null, department: null }
};

function clientAdminReducer(state, action) {
  switch (action.type) {
    case 'SET_COMPLIANCE':
      return { ...state, compliance: action.payload };
    case 'SET_PENDING_APPROVALS':
      return { ...state, pendingApprovals: action.payload };
    case 'SET_MISSING_DATA':
      return { ...state, missingData: action.payload };
    case 'SET_USER_ACTIVITY':
      return { ...state, userActivity: action.payload };
    case 'SET_KPI_BREAKDOWN':
      return { ...state, kpiBreakdown: action.payload };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'UPDATE_PENDING_APPROVAL':
      return {
        ...state,
        pendingApprovals: state.pendingApprovals.filter(a => a.id !== action.payload)
      };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters, dateRange: initialState.dateRange };
    default:
      return state;
  }
}

export const ClientAdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clientAdminReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.dashboard?.clientAdmin);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('client_admin');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadCompliance = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchClientAdminCompliance()).unwrap();
      dispatch({ type: 'SET_COMPLIANCE', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load compliance:', error);
      return null;
    }
  }, [reduxDispatch]);

  const loadPendingApprovals = useCallback(async (page = 1, pageSize = 20) => {
    try {
      const result = await reduxDispatch(fetchClientAdminPendingApprovals({ page, pageSize })).unwrap();
      dispatch({ type: 'SET_PENDING_APPROVALS', payload: result.results || result });
      return result;
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadMissingData = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchClientAdminMissingData()).unwrap();
      dispatch({ type: 'SET_MISSING_DATA', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load missing data:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadUserActivity = useCallback(async (days = 30) => {
    try {
      const result = await reduxDispatch(fetchClientAdminUserActivity(days)).unwrap();
      dispatch({ type: 'SET_USER_ACTIVITY', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load user activity:', error);
      return null;
    }
  }, [reduxDispatch]);

  const loadKpiBreakdown = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchClientAdminKpiBreakdown()).unwrap();
      dispatch({ type: 'SET_KPI_BREAKDOWN', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load KPI breakdown:', error);
      return null;
    }
  }, [reduxDispatch]);

  const removePendingApproval = useCallback((approvalId) => {
    dispatch({ type: 'UPDATE_PENDING_APPROVAL', payload: approvalId });
  }, []);

  const selectUser = useCallback((userId) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: userId });
  }, []);

  const setDateRange = useCallback((range) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: range });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateClientAdminData(data));
  }, [reduxDispatch]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadCompliance(),
      loadPendingApprovals(),
      loadMissingData(),
      loadUserActivity(),
      loadKpiBreakdown()
    ]);
  }, [loadCompliance, loadPendingApprovals, loadMissingData, loadUserActivity, loadKpiBreakdown]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    loadDashboard,
    loadCompliance,
    loadPendingApprovals,
    loadMissingData,
    loadUserActivity,
    loadKpiBreakdown,
    removePendingApproval,
    selectUser,
    setDateRange,
    setFilters,
    resetFilters,
    updateDashboardData,
    loadAllData
  };

  return (
    <ClientAdminContext.Provider value={value}>
      {children}
    </ClientAdminContext.Provider>
  );
};

export const useClientAdmin = () => {
  const context = useContext(ClientAdminContext);
  if (!context) {
    throw new Error('useClientAdmin must be used within a ClientAdminProvider');
  }
  return context;
};