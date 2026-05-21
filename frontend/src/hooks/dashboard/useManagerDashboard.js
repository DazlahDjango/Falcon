// frontend/src/hooks/dashboard/useManagerDashboard.js

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { managerService } from '../../services/dashboard/manager.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useManagerDashboard = (options = {}) => {
  const { autoFetch = true, period: initialPeriod = 'current', includeTeam: initialIncludeTeam = true } = options;
  const dispatch = useDispatch();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamSummary, setTeamSummary] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [period, setPeriod] = useState(initialPeriod);
  const [includeTeam, setIncludeTeam] = useState(initialIncludeTeam);
  const [drillDownUserId, setDrillDownUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await managerService.getDashboardData({ 
        period, 
        includeTeam, 
        userId: drillDownUserId 
      });
      if (response?.success) {
        setDashboardData(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch dashboard data', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [period, includeTeam, drillDownUserId, dispatch]);

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await managerService.getTeamMembers(drillDownUserId);
      if (response?.success) {
        setTeamMembers(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch team members', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [drillDownUserId, dispatch]);

  const fetchTeamSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await managerService.getTeamSummary();
      if (response?.success) {
        setTeamSummary(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch team summary', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchPendingApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await managerService.getPendingApprovals();
      if (response?.success) {
        setPendingApprovals(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch pending approvals', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const approveSubmission = useCallback(async (submissionId, comments = '') => {
    setApproving(true);
    try {
      const response = await managerService.approveSubmission(submissionId, comments);
      if (response?.success) {
        dispatch(showToast({ message: 'Submission approved successfully', type: 'success' }));
        await fetchPendingApprovals();
        await fetchDashboardData();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to approve submission', type: 'error' }));
      return false;
    } finally {
      setApproving(false);
    }
  }, [dispatch, fetchPendingApprovals, fetchDashboardData]);

  const rejectSubmission = useCallback(async (submissionId, comments) => {
    setRejecting(true);
    try {
      const response = await managerService.rejectSubmission(submissionId, comments);
      if (response?.success) {
        dispatch(showToast({ message: 'Submission rejected', type: 'success' }));
        await fetchPendingApprovals();
        await fetchDashboardData();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to reject submission', type: 'error' }));
      return false;
    } finally {
      setRejecting(false);
    }
  }, [dispatch, fetchPendingApprovals, fetchDashboardData]);

  const drillDown = useCallback(async (userId) => {
    setDrillDownUserId(userId);
    setLoading(true);
    try {
      const response = await managerService.drillDown(userId, period);
      if (response?.success) {
        setDashboardData(response.data);
        dispatch(showToast({ message: `Viewing team member dashboard`, type: 'info' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to drill down', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [period, dispatch]);

  const resetDrillDown = useCallback(() => {
    setDrillDownUserId(null);
    fetchDashboardData();
    fetchTeamMembers();
    dispatch(showToast({ message: 'Back to your dashboard', type: 'info' }));
  }, [fetchDashboardData, fetchTeamMembers, dispatch]);

  const exportDashboard = useCallback(async (format = 'pdf') => {
    setExporting(true);
    try {
      const response = await managerService.exportDashboard({ period, includeTeam, format });
      if (response?.success || response?.data) {
        const blob = response.data || response;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `manager_dashboard_${period}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        dispatch(showToast({ message: 'Export completed', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to export dashboard', type: 'error' }));
      return false;
    } finally {
      setExporting(false);
    }
  }, [period, includeTeam, dispatch]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchTeamMembers(),
      fetchTeamSummary(),
      fetchPendingApprovals(),
    ]);
  }, [fetchDashboardData, fetchTeamMembers, fetchTeamSummary, fetchPendingApprovals]);

  useEffect(() => {
    if (autoFetch) {
      refreshAll();
    }
  }, [autoFetch, refreshAll]);

  // Re-fetch when period or includeTeam changes
  useEffect(() => {
    if (autoFetch) {
      fetchDashboardData();
      fetchTeamMembers();
    }
  }, [period, includeTeam, autoFetch, fetchDashboardData, fetchTeamMembers]);

  return {
    dashboardData,
    teamMembers,
    teamSummary,
    pendingApprovals,
    period,
    includeTeam,
    drillDownUserId,
    loading,
    approving,
    rejecting,
    exporting,
    setPeriod,
    setIncludeTeam,
    fetchDashboardData,
    fetchTeamMembers,
    fetchTeamSummary,
    fetchPendingApprovals,
    approveSubmission,
    rejectSubmission,
    drillDown,
    resetDrillDown,
    exportDashboard,
    refreshAll,
  };
};