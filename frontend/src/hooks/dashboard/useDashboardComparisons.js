import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { comparisonService } from '../../services/dashboard/comparison.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useDashboardComparisons = (options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  
  const [comparisons, setComparisons] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const fetchComparisons = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await comparisonService.getComparisons(filters);
      if (response?.success) {
        setComparisons(response.data.results || response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch comparisons', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createComparison = useCallback(async (comparisonData) => {
    setLoading(true);
    try {
      const response = await comparisonService.createComparison(comparisonData);
      if (response?.success) {
        setComparisons(prev => [response.data, ...prev]);
        dispatch(showToast({ message: 'Comparison created', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to create comparison', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateComparison = useCallback(async (comparisonId, comparisonData) => {
    setLoading(true);
    try {
      const response = await comparisonService.updateComparison(comparisonId, comparisonData);
      if (response?.success) {
        setComparisons(prev => prev.map(c => c.id === comparisonId ? response.data : c));
        dispatch(showToast({ message: 'Comparison updated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update comparison', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteComparison = useCallback(async (comparisonId) => {
    setLoading(true);
    try {
      const response = await comparisonService.deleteComparison(comparisonId);
      if (response?.success) {
        setComparisons(prev => prev.filter(c => c.id !== comparisonId));
        if (selectedComparison?.id === comparisonId) {
          setSelectedComparison(null);
          setComparisonResults(null);
        }
        dispatch(showToast({ message: 'Comparison deleted', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to delete comparison', type: 'error' }));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch, selectedComparison]);

  const calculateComparison = useCallback(async (comparisonId) => {
    if (!comparisonId) return null;
    setCalculating(true);
    try {
      const response = await comparisonService.calculateComparison(comparisonId);
      if (response?.success) {
        setComparisonResults(response.data);
        dispatch(showToast({ message: 'Comparison calculated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to calculate comparison', type: 'error' }));
      return null;
    } finally {
      setCalculating(false);
    }
  }, [dispatch]);

  const selectComparison = useCallback(async (comparisonId) => {
    const comparison = comparisons.find(c => c.id === comparisonId);
    if (comparison) {
      setSelectedComparison(comparison);
      if (comparison.cached_results) {
        setComparisonResults(comparison.cached_results);
      } else {
        await calculateComparison(comparisonId);
      }
    }
  }, [comparisons, calculateComparison]);

  const clearSelected = useCallback(() => {
    setSelectedComparison(null);
    setComparisonResults(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchComparisons();
    }
  }, [autoFetch, fetchComparisons]);

  return {
    comparisons,
    selectedComparison,
    comparisonResults,
    loading,
    calculating,
    fetchComparisons,
    createComparison,
    updateComparison,
    deleteComparison,
    calculateComparison,
    selectComparison,
    clearSelected
  };
};