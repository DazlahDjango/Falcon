import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { superAdminDashboardService } from '../../services/dashboard/superAdmin.service';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDashboard } from './useDashboard';

export const useSuperAdminDashboard = (options = {}) => {
  const dispatch = useDispatch();
  const [tenants, setTenants] = useState([]);
  const [tenantsTotal, setTenantsTotal] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState(null);
  const [billingOverview, setBillingOverview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [refreshingTenant, setRefreshingTenant] = useState(false);

  const refreshAllRef = useRef(null);

  const onWebsocketMessage = useCallback((message) => {
    if (message.type === 'kpi_update' || message.type === 'dashboard_update' || message.type === 'update') {
      if (refreshAllRef.current) {
        refreshAllRef.current().catch(console.error);
      }
    }
  }, []);

  const {
    data: dashboardData,
    loading,
    error,
    refresh: refreshDashboard
  } = useDashboard('super_admin', { ...options, onWebsocketMessage });

  const fetchTenants = useCallback(async (filters = {}) => {
    setTenantsLoading(true);
    try {
      const response = await superAdminDashboardService.getTenantsList(filters);
      if (response?.success) {
        setTenants(response.data.results || response.data);
        setTenantsTotal(response.data.count || response.data.length || 0);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch tenants', type: 'error' }));
      return [];
    } finally {
      setTenantsLoading(false);
    }
  }, [dispatch]);

  const fetchTenantDetails = useCallback(async (tenantId) => {
    if (!tenantId) return null;
    try {
      const response = await superAdminDashboardService.getTenantDetails(tenantId);
      if (response?.success) {
        setSelectedTenant(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch tenant details', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const refreshTenantSnapshot = useCallback(async (tenantId) => {
    if (!tenantId) return false;
    setRefreshingTenant(true);
    try {
      const response = await superAdminDashboardService.refreshTenantSnapshot(tenantId);
      if (response?.success) {
        dispatch(showToast({ message: 'Tenant snapshot refreshed successfully', type: 'success' }));
        await fetchTenants();
        if (selectedTenant?.client_id === tenantId) {
          await fetchTenantDetails(tenantId);
        }
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to refresh tenant snapshot', type: 'error' }));
      return false;
    } finally {
      setRefreshingTenant(false);
    }
  }, [dispatch, fetchTenants, fetchTenantDetails, selectedTenant]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await superAdminDashboardService.getSystemHealth();
      if (response?.success) {
        setSystemHealth(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch system health', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const fetchSubscriptionAlerts = useCallback(async () => {
    try {
      const response = await superAdminDashboardService.getSubscriptionAlerts();
      if (response?.success) {
        setSubscriptionAlerts(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch subscription alerts', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const fetchPlatformMetrics = useCallback(async () => {
    try {
      const response = await superAdminDashboardService.getPlatformMetrics();
      if (response?.success) {
        setPlatformMetrics(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch platform metrics', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const fetchBillingOverview = useCallback(async () => {
    try {
      const response = await superAdminDashboardService.getBillingOverview();
      if (response?.success) {
        setBillingOverview(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch billing overview', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const fetchAuditLogs = useCallback(async (filters = {}) => {
    try {
      const response = await superAdminDashboardService.getAuditLogs(filters);
      if (response?.success) {
        setAuditLogs(response.data.results || response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch audit logs', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const refreshAll = useCallback(async () => {
    await refreshDashboard();
    await Promise.all([
      fetchTenants(),
      fetchSystemHealth(),
      fetchSubscriptionAlerts(),
      fetchPlatformMetrics(),
      fetchBillingOverview()
    ]);
  }, [refreshDashboard, fetchTenants, fetchSystemHealth, fetchSubscriptionAlerts, fetchPlatformMetrics, fetchBillingOverview]);

  useEffect(() => {
    refreshAllRef.current = refreshAll;
  }, [refreshAll]);

  return {
    dashboardData,
    tenants,
    tenantsTotal,
    selectedTenant,
    systemHealth,
    subscriptionAlerts,
    platformMetrics,
    billingOverview,
    auditLogs,
    tenantsLoading,
    refreshingTenant,
    loading,
    error,
    fetchTenants,
    fetchTenantDetails,
    refreshTenantSnapshot,
    fetchSystemHealth,
    fetchSubscriptionAlerts,
    fetchPlatformMetrics,
    fetchBillingOverview,
    fetchAuditLogs,
    setSelectedTenant,
    refreshDashboard,
    refreshAll
  };
};