// frontend/src/hooks/dashboard/useViewPresets.js

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { viewPresetService } from '../../services/dashboard/viewpreset.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useViewPresets = (dashboardType = null, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [defaultPreset, setDefaultPreset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPresets = useCallback(async () => {
    if (!dashboardType) return [];
    setLoading(true);
    try {
      const response = await viewPresetService.getByDashboardType(dashboardType);
      if (response?.success) {
        setPresets(response.data);
        const defaultP = response.data?.find(p => p.is_default);
        if (defaultP) setDefaultPreset(defaultP);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch view presets', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dashboardType, dispatch]);

  const createPreset = useCallback(async (presetData) => {
    setSaving(true);
    try {
      const response = await viewPresetService.create({ ...presetData, dashboard_type: dashboardType });
      if (response?.success) {
        setPresets(prev => [...prev, response.data]);
        if (response.data.is_default) {
          setDefaultPreset(response.data);
          setPresets(prev => prev.map(p => 
            p.id !== response.data.id ? { ...p, is_default: false } : p
          ));
        }
        dispatch(showToast({ message: 'View preset saved', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to save preset', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [dashboardType, dispatch]);

  const updatePreset = useCallback(async (presetId, presetData) => {
    if (!presetId) return null;
    setSaving(true);
    try {
      const response = await viewPresetService.update(presetId, presetData);
      if (response?.success) {
        setPresets(prev => prev.map(p => p.id === presetId ? response.data : p));
        if (response.data.is_default) {
          setDefaultPreset(response.data);
          setPresets(prev => prev.map(p => 
            p.id !== presetId ? { ...p, is_default: false } : p
          ));
        }
        dispatch(showToast({ message: 'Preset updated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update preset', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const deletePreset = useCallback(async (presetId) => {
    if (!presetId) return false;
    setSaving(true);
    try {
      const response = await viewPresetService.delete(presetId);
      if (response?.success) {
        const deletedPreset = presets.find(p => p.id === presetId);
        setPresets(prev => prev.filter(p => p.id !== presetId));
        if (deletedPreset?.is_default) {
          setDefaultPreset(null);
        }
        dispatch(showToast({ message: 'Preset deleted', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to delete preset', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch, presets]);

  const setDefaultPresetById = useCallback(async (presetId) => {
    if (!presetId) return null;
    setSaving(true);
    try {
      const response = await viewPresetService.setDefault(presetId);
      if (response?.success) {
        setPresets(prev => prev.map(p => ({
          ...p,
          is_default: p.id === presetId
        })));
        const newDefault = presets.find(p => p.id === presetId);
        setDefaultPreset(newDefault || null);
        dispatch(showToast({ message: 'Default preset set', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to set default preset', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch, presets]);

  const loadPreset = useCallback(async (presetId) => {
    if (!presetId) return null;
    setLoading(true);
    try {
      const response = await viewPresetService.getById(presetId);
      if (response?.success) {
        setSelectedPreset(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to load preset', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const applyPreset = useCallback(async (presetId, targetDashboardId) => {
    if (!presetId) return null;
    setSaving(true);
    try {
      const response = await viewPresetService.applyPreset(presetId, targetDashboardId);
      if (response?.success) {
        dispatch(showToast({ message: 'Preset applied successfully', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to apply preset', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const refreshPresets = useCallback(async () => {
    return fetchPresets();
  }, [fetchPresets]);

  useEffect(() => {
    if (autoFetch && dashboardType) {
      fetchPresets();
    }
  }, [autoFetch, dashboardType, fetchPresets]);

  return {
    presets,
    selectedPreset,
    defaultPreset,
    loading,
    saving,
    fetchPresets,
    createPreset,
    updatePreset,
    deletePreset,
    setDefaultPreset: setDefaultPresetById,
    loadPreset,
    applyPreset,
    refreshPresets,
    setSelectedPreset,
  };
};