import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { backupService } from '../../services/config';

const BackupContext = createContext(null);

const initialState = {
  jobs: [],
  policies: [],
  artifacts: [],
  stats: null,
  filters: { page: 1, limit: 20, status: '', backup_type: '', app_name: '' },
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  selectedJob: null
};

function backupReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, loading: false };
    case 'SET_POLICIES':
      return { ...state, policies: action.payload };
    case 'SET_ARTIFACTS':
      return { ...state, artifacts: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'SET_SELECTED_JOB':
      return { ...state, selectedJob: action.payload };
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job => job.id === action.payload.id ? { ...job, ...action.payload } : job),
        selectedJob: state.selectedJob?.id === action.payload.id ? { ...state.selectedJob, ...action.payload } : state.selectedJob
      };
    case 'REMOVE_JOB':
      return { ...state, jobs: state.jobs.filter(job => job.id !== action.payload) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const BackupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(backupReducer, initialState);

  const fetchJobs = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await backupService.list(state.filters);
      dispatch({ type: 'SET_JOBS', payload: response.data?.results || [] });
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          total: response.data?.count || 0,
          pages: Math.ceil((response.data?.count || 0) / state.filters.limit),
          page: state.filters.page,
          limit: state.filters.limit
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.filters]);

  const fetchPolicies = useCallback(async () => {
    try {
      const response = await backupService.getPolicies();
      dispatch({ type: 'SET_POLICIES', payload: response.data?.results || [] });
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    }
  }, []);

  const fetchArtifacts = useCallback(async () => {
    try {
      const response = await backupService.getArtifacts();
      dispatch({ type: 'SET_ARTIFACTS', payload: response.data?.results || [] });
    } catch (error) {
      console.error('Failed to fetch artifacts:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await backupService.getBackupStats();
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const triggerBackup = useCallback(async (appName, backupType) => {
    try {
      const response = await backupService.triggerBackup(appName, backupType);
      const newJob = response.data;
      dispatch({ type: 'ADD_JOB', payload: newJob });
      return newJob;
    } catch (error) {
      console.error('Failed to trigger backup:', error);
      throw error;
    }
  }, []);

  const cancelBackup = useCallback(async (jobId) => {
    try {
      await backupService.cancelBackup(jobId);
      dispatch({ type: 'UPDATE_JOB', payload: { id: jobId, status: 'cancelled' } });
    } catch (error) {
      console.error('Failed to cancel backup:', error);
      throw error;
    }
  }, []);

  const restoreBackup = useCallback(async (jobId, targetAppOnly = false) => {
    try {
      const response = await backupService.restoreBackup(jobId, targetAppOnly);
      return response.data;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }, []);

  const verifyBackup = useCallback(async (jobId) => {
    try {
      await backupService.verifyBackup(jobId);
      dispatch({ type: 'UPDATE_JOB', payload: { id: jobId, status: 'verifying' } });
    } catch (error) {
      console.error('Failed to verify backup:', error);
      throw error;
    }
  }, []);

  const updateFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const selectJob = useCallback((job) => {
    dispatch({ type: 'SET_SELECTED_JOB', payload: job });
  }, []);

  const refresh = useCallback(() => {
    fetchJobs();
    fetchPolicies();
    fetchArtifacts();
    fetchStats();
  }, [fetchJobs, fetchPolicies, fetchArtifacts, fetchStats]);

  const value = {
    ...state,
    fetchJobs,
    fetchPolicies,
    fetchArtifacts,
    fetchStats,
    triggerBackup,
    cancelBackup,
    restoreBackup,
    verifyBackup,
    updateFilters,
    selectJob,
    refresh
  };

  return <BackupContext.Provider value={value}>{children}</BackupContext.Provider>;
};

export const useBackupContext = () => {
  const context = useContext(BackupContext);
  if (!context) {
    throw new Error('useBackupContext must be used within BackupProvider');
  }
  return context;
};