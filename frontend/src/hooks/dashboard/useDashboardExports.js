import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { exportService } from '../../services/dashboard/export.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useDashboardExports = (options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  
  const [exports, setExports] = useState([]);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchExports = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await exportService.getExports(filters);
      if (response?.success) {
        setExports(response.data.results || response.data);
        setTotal(response.data.count || response.data.length || 0);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch exports', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await exportService.getExportHistory();
      if (response?.success) {
        setHistory(response.data.results || response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch export history:', err);
      return [];
    }
  }, []);

  const createExport = useCallback(async (exportData) => {
    setLoading(true);
    try {
      const response = await exportService.createExport(exportData);
      if (response?.success) {
        setExports(prev => [response.data, ...prev]);
        setTotal(prev => prev + 1);
        dispatch(showToast({ message: 'Export schedule created', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to create export', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateExport = useCallback(async (exportId, exportData) => {
    setLoading(true);
    try {
      const response = await exportService.updateExport(exportId, exportData);
      if (response?.success) {
        setExports(prev => prev.map(e => e.id === exportId ? response.data : e));
        dispatch(showToast({ message: 'Export schedule updated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update export', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteExport = useCallback(async (exportId) => {
    setLoading(true);
    try {
      const response = await exportService.deleteExport(exportId);
      if (response?.success) {
        setExports(prev => prev.filter(e => e.id !== exportId));
        setTotal(prev => prev - 1);
        dispatch(showToast({ message: 'Export schedule deleted', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to delete export', type: 'error' }));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const triggerExport = useCallback(async (exportId) => {
    setExporting(true);
    try {
      const response = await exportService.triggerExport(exportId);
      if (response?.success) {
        dispatch(showToast({ message: 'Export triggered successfully', type: 'success' }));
        await fetchExports();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to trigger export', type: 'error' }));
      return false;
    } finally {
      setExporting(false);
    }
  }, [dispatch, fetchExports]);

  const downloadExport = useCallback(async (exportId, filename = 'dashboard_export') => {
    setExporting(true);
    try {
      const response = await exportService.downloadExport(exportId);
      if (response?.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        dispatch(showToast({ message: 'Download started', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to download export', type: 'error' }));
      return false;
    } finally {
      setExporting(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) {
      fetchExports();
      fetchHistory();
    }
  }, [autoFetch, fetchExports, fetchHistory]);

  return {
    exports,
    history,
    total,
    loading,
    exporting,
    fetchExports,
    fetchHistory,
    createExport,
    updateExport,
    deleteExport,
    triggerExport,
    downloadExport
  };
};