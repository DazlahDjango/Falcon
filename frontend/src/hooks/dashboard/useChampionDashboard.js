// frontend/src/hooks/dashboard/useChampionDashboard.js

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { championService } from '../../services/dashboard/champion.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useChampionDashboard = (options = {}) => {
  const { autoFetch = true, targetUserId: initialTargetUserId = null, period: initialPeriod = 'current' } = options;
  const dispatch = useDispatch();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [availableKPIs, setAvailableKPIs] = useState([]);
  const [assignedKPIs, setAssignedKPIs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [targetUserId, setTargetUserId] = useState(initialTargetUserId);
  const [period, setPeriod] = useState(initialPeriod);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const fetchEditableDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await championService.getEditableDashboard(targetUserId, period);
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
  }, [targetUserId, period, dispatch]);

  const fetchAvailableKPIs = useCallback(async () => {
    if (!targetUserId) return [];
    setLoading(true);
    try {
      const response = await championService.getAvailableKPIs(targetUserId);
      if (response?.success) {
        setAvailableKPIs(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch available KPIs', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [targetUserId, dispatch]);

  const fetchAssignedKPIs = useCallback(async () => {
    if (!targetUserId) return [];
    setLoading(true);
    try {
      const response = await championService.getAssignedKPIs(targetUserId);
      if (response?.success) {
        setAssignedKPIs(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch assigned KPIs', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [targetUserId, dispatch]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await championService.getTemplates();
      if (response?.success) {
        setTemplates(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch templates', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateDashboardConfig = useCallback(async (config) => {
    setSaving(true);
    try {
      const response = await championService.updateDashboardConfig({ userId: targetUserId, config });
      if (response?.success) {
        dispatch(showToast({ message: 'Dashboard configuration updated', type: 'success' }));
        await fetchEditableDashboard();
        await fetchAssignedKPIs();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update configuration', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetUserId, dispatch, fetchEditableDashboard, fetchAssignedKPIs]);

  const addKPI = useCallback(async (kpiId, weight = 1) => {
    setSaving(true);
    try {
      const response = await championService.addKPI({ userId: targetUserId, kpiId, weight });
      if (response?.success) {
        dispatch(showToast({ message: 'KPI added to dashboard', type: 'success' }));
        await fetchAssignedKPIs();
        await fetchAvailableKPIs();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to add KPI', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetUserId, dispatch, fetchAssignedKPIs, fetchAvailableKPIs]);

  const removeKPI = useCallback(async (kpiId) => {
    setSaving(true);
    try {
      const response = await championService.removeKPI({ userId: targetUserId, kpiId });
      if (response?.success) {
        dispatch(showToast({ message: 'KPI removed from dashboard', type: 'success' }));
        await fetchAssignedKPIs();
        await fetchAvailableKPIs();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to remove KPI', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetUserId, dispatch, fetchAssignedKPIs, fetchAvailableKPIs]);

  const updateKPIWeights = useCallback(async (weights) => {
    setSaving(true);
    try {
      const response = await championService.updateKPIWeights({ userId: targetUserId, weights });
      if (response?.success) {
        dispatch(showToast({ message: 'KPI weights updated', type: 'success' }));
        await fetchAssignedKPIs();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update weights', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetUserId, dispatch, fetchAssignedKPIs]);

  const updateKPITargets = useCallback(async (targets, targetPeriod = null) => {
    setSaving(true);
    try {
      const response = await championService.updateKPITargets({ 
        userId: targetUserId, 
        targets, 
        period: targetPeriod || period 
      });
      if (response?.success) {
        dispatch(showToast({ message: 'KPI targets updated', type: 'success' }));
        await fetchEditableDashboard();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update targets', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [targetUserId, period, dispatch, fetchEditableDashboard]);

  const createTemplate = useCallback(async (name, description, category, configuration) => {
    setCreatingTemplate(true);
    try {
      const response = await championService.createTemplate({ name, description, category, configuration });
      if (response?.success) {
        dispatch(showToast({ message: 'Template created successfully', type: 'success' }));
        await fetchTemplates();
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to create template', type: 'error' }));
      return null;
    } finally {
      setCreatingTemplate(false);
    }
  }, [dispatch, fetchTemplates]);

  const applyTemplate = useCallback(async (templateId) => {
    setApplyingTemplate(true);
    try {
      const response = await championService.applyTemplate(templateId, targetUserId);
      if (response?.success) {
        dispatch(showToast({ message: 'Template applied successfully', type: 'success' }));
        await fetchEditableDashboard();
        await fetchAssignedKPIs();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to apply template', type: 'error' }));
      return false;
    } finally {
      setApplyingTemplate(false);
    }
  }, [targetUserId, dispatch, fetchEditableDashboard, fetchAssignedKPIs]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchEditableDashboard(),
      fetchAssignedKPIs(),
      fetchAvailableKPIs(),
      fetchTemplates(),
    ]);
  }, [fetchEditableDashboard, fetchAssignedKPIs, fetchAvailableKPIs, fetchTemplates]);

  useEffect(() => {
    if (autoFetch && targetUserId) {
      refreshAll();
    } else if (autoFetch && !targetUserId) {
      fetchTemplates();
    }
  }, [autoFetch, targetUserId, refreshAll, fetchTemplates]);

  return {
    dashboardData,
    availableKPIs,
    assignedKPIs,
    templates,
    targetUserId,
    period,
    loading,
    saving,
    creatingTemplate,
    applyingTemplate,
    setTargetUserId,
    setPeriod,
    fetchEditableDashboard,
    fetchAvailableKPIs,
    fetchAssignedKPIs,
    fetchTemplates,
    updateDashboardConfig,
    addKPI,
    removeKPI,
    updateKPIWeights,
    updateKPITargets,
    createTemplate,
    applyTemplate,
    refreshAll,
  };
};