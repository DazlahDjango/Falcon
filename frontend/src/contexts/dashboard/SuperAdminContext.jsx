import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSuperAdminDashboard,
  fetchSuperAdminTenants,
  fetchSuperAdminSystemHealth,
  fetchSuperAdminSubscriptionAlerts,
  fetchSuperAdminPlatformMetrics,
  refreshTenantSnapshot,
  updateSuperAdminData
} from '../../store/dashboard/slices/dashboardSlice';
import { useDashboard } from './DashboardContext';

const SuperAdminContext = createContext(null);

const initialState = {
  tenants: [],
  systemHealth: null,
  subscriptionAlerts: [],
  platformMetrics: null,
  billingOverview: null,
  selectedTenant: null,
  filters: { status: null, plan: null, search: '' }
};

function superAdminReducer(state, action) {
  switch (action.type) {
    case 'SET_TENANTS':
      return { ...state, tenants: action.payload };
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    case 'SET_SUBSCRIPTION_ALERTS':
      return { ...state, subscriptionAlerts: action.payload };
    case 'SET_PLATFORM_METRICS':
      return { ...state, platformMetrics: action.payload };
    case 'SET_BILLING_OVERVIEW':
      return { ...state, billingOverview: action.payload };
    case 'SET_SELECTED_TENANT':
      return { ...state, selectedTenant: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'UPDATE_TENANT':
      return {
        ...state,
        tenants: state.tenants.map(t => 
          t.client_id === action.payload.client_id ? { ...t, ...action.payload.data } : t
        )
      };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
}

export const SuperAdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(superAdminReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.dashboard?.superAdmin);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('super_admin');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadTenants = useCallback(async (filters = {}) => {
    try {
      const result = await reduxDispatch(fetchSuperAdminTenants(filters)).unwrap();
      dispatch({ type: 'SET_TENANTS', payload: result.results || result });
      return result;
    } catch (error) {
      console.error('Failed to load tenants:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadSystemHealth = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchSuperAdminSystemHealth()).unwrap();
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load system health:', error);
      return null;
    }
  }, [reduxDispatch]);

  const loadSubscriptionAlerts = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchSuperAdminSubscriptionAlerts()).unwrap();
      dispatch({ type: 'SET_SUBSCRIPTION_ALERTS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load subscription alerts:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadPlatformMetrics = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchSuperAdminPlatformMetrics()).unwrap();
      dispatch({ type: 'SET_PLATFORM_METRICS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load platform metrics:', error);
      return null;
    }
  }, [reduxDispatch]);

  const refreshTenant = useCallback(async (tenantId) => {
    try {
      const result = await reduxDispatch(refreshTenantSnapshot(tenantId)).unwrap();
      dispatch({ type: 'UPDATE_TENANT', payload: { client_id: tenantId, data: result.data } });
      return result;
    } catch (error) {
      console.error('Failed to refresh tenant:', error);
      return null;
    }
  }, [reduxDispatch]);

  const selectTenant = useCallback((tenant) => {
    dispatch({ type: 'SET_SELECTED_TENANT', payload: tenant });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    loadTenants(filters);
  }, [loadTenants]);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
    loadTenants({});
  }, [loadTenants]);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateSuperAdminData(data));
  }, [reduxDispatch]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadTenants(),
      loadSystemHealth(),
      loadSubscriptionAlerts(),
      loadPlatformMetrics()
    ]);
  }, [loadTenants, loadSystemHealth, loadSubscriptionAlerts, loadPlatformMetrics]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    loadDashboard,
    loadTenants,
    loadSystemHealth,
    loadSubscriptionAlerts,
    loadPlatformMetrics,
    refreshTenant,
    selectTenant,
    setFilters,
    resetFilters,
    updateDashboardData,
    loadAllData
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};