import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clientAdminDashboardService } from '../../services/dashboard/clientAdmin.service';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDashboard } from './useDashboard';

export const useClientAdminDashboard = (options = {}) => {
  const dispatch = useDispatch();
  const [compliance, setCompliance] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [missingData, setMissingData] = useState([]);
  const [userActivity, setUserActivity] = useState(null);
  const [kpiBreakdown, setKpiBreakdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const refreshAllRef = useRef(null);

  const onWebsocketMessage = useCallback((message) => {
    if (message.type === 'kpi_update' || message.type === 'dashboard_update' || message.type === 'update') {
      if (refreshAllRef.current) {
        // Run refresh but don't await so we don't block
        refreshAllRef.current().catch(console.error);
      }
    }
  }, []);

  const {
    data: dashboardData,
    loading,
    error,
    refresh: refreshDashboard
  } = useDashboard('client_admin', { ...options, onWebsocketMessage });

  const fetchCompliance = useCallback(async () => {
    try {
      const response = await clientAdminDashboardService.getComplianceStatus();
      if (response?.success) {
        setCompliance(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch compliance', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const fetchPendingApprovals = useCallback(async (page = 1, pageSize = 20) => {
    try {
      const response = await clientAdminDashboardService.getPendingApprovals(page, pageSize);
      if (response?.success) {
        setPendingApprovals(response.data.results || response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch pending approvals', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const approveSubmission = useCallback(async (submissionId, comments = '') => {
    if (!submissionId) return false;
    setApprovalLoading(true);
    try {
      const response = await clientAdminDashboardService.approveSubmission(submissionId, comments);
      if (response?.success) {
        dispatch(showToast({ message: 'Submission approved successfully', type: 'success' }));
        await fetchPendingApprovals();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to approve submission', type: 'error' }));
      return false;
    } finally {
      setApprovalLoading(false);
    }
  }, [dispatch, fetchPendingApprovals]);

  const rejectSubmission = useCallback(async (submissionId, reason = '') => {
    if (!submissionId) return false;
    setApprovalLoading(true);
    try {
      const response = await clientAdminDashboardService.rejectSubmission(submissionId, reason);
      if (response?.success) {
        dispatch(showToast({ message: 'Submission rejected successfully', type: 'success' }));
        await fetchPendingApprovals();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to reject submission', type: 'error' }));
      return false;
    } finally {
      setApprovalLoading(false);
    }
  }, [dispatch, fetchPendingApprovals]);

  const fetchMissingData = useCallback(async () => {
    try {
      const response = await clientAdminDashboardService.getMissingDataAlerts();
      if (response?.success) {
        setMissingData(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch missing data', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const fetchUserActivity = useCallback(async (days = 30) => {
    try {
      const response = await clientAdminDashboardService.getUserActivity(days);
      if (response?.success) {
        setUserActivity(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch user activity', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const fetchKpiBreakdown = useCallback(async () => {
    try {
      const response = await clientAdminDashboardService.getKpiBreakdown();
      if (response?.success) {
        setKpiBreakdown(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch KPI breakdown', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const fetchUsers = useCallback(async (filters = {}) => {
    setUsersLoading(true);
    try {
      const response = await clientAdminDashboardService.getUsersList(filters);
      if (response?.success) {
        setUsers(response.data.results || response.data);
        setUsersTotal(response.data.count || response.data.length || 0);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch users', type: 'error' }));
      return [];
    } finally {
      setUsersLoading(false);
    }
  }, [dispatch]);

  const getUserDetails = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const response = await clientAdminDashboardService.getUserDetails(userId);
      if (response?.success) {
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch user details', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const refreshAll = useCallback(async () => {
    await refreshDashboard();
    await Promise.all([
      fetchCompliance(),
      fetchPendingApprovals(),
      fetchMissingData(),
      fetchUserActivity(),
      fetchKpiBreakdown()
    ]);
  }, [refreshDashboard, fetchCompliance, fetchPendingApprovals, fetchMissingData, fetchUserActivity, fetchKpiBreakdown]);

  useEffect(() => {
    refreshAllRef.current = refreshAll;
  }, [refreshAll]);

  return {
    dashboardData,
    compliance,
    pendingApprovals,
    missingData,
    userActivity,
    kpiBreakdown,
    users,
    usersTotal,
    usersLoading,
    approvalLoading,
    loading,
    error,
    fetchCompliance,
    fetchPendingApprovals,
    approveSubmission,
    rejectSubmission,
    fetchMissingData,
    fetchUserActivity,
    fetchKpiBreakdown,
    fetchUsers,
    getUserDetails,
    refreshDashboard,
    refreshAll
  };
};