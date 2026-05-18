import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { disasterRecoveryService } from '../../services/config';

const DRContext = createContext(null);

const initialState = {
  plans: [],
  executions: [],
  metrics: null,
  stats: null,
  filters: { page: 1, limit: 20, status: '', execution_type: '' },
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,
  selectedPlan: null,
  selectedExecution: null
};

function drReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PLANS':
      return { ...state, plans: action.payload, loading: false };
    case 'SET_EXECUTIONS':
      return { ...state, executions: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'SET_SELECTED_PLAN':
      return { ...state, selectedPlan: action.payload };
    case 'SET_SELECTED_EXECUTION':
      return { ...state, selectedExecution: action.payload };
    case 'ADD_PLAN':
      return { ...state, plans: [action.payload, ...state.plans] };
    case 'UPDATE_PLAN':
      return {
        ...state,
        plans: state.plans.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p),
        selectedPlan: state.selectedPlan?.id === action.payload.id ? { ...state.selectedPlan, ...action.payload } : state.selectedPlan
      };
    case 'ADD_EXECUTION':
      return { ...state, executions: [action.payload, ...state.executions] };
    case 'UPDATE_EXECUTION':
      return {
        ...state,
        executions: state.executions.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e),
        selectedExecution: state.selectedExecution?.id === action.payload.id ? { ...state.selectedExecution, ...action.payload } : state.selectedExecution
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const DRProvider = ({ children }) => {
  const [state, dispatch] = useReducer(drReducer, initialState);

  const fetchPlans = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await disasterRecoveryService.getPlans(state.filters);
      dispatch({ type: 'SET_PLANS', payload: response.data?.results || [] });
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

  const fetchExecutions = useCallback(async () => {
    try {
      const response = await disasterRecoveryService.getExecutions();
      dispatch({ type: 'SET_EXECUTIONS', payload: response.data?.results || [] });
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
  }, []);

  const fetchMetrics = useCallback(async (appName = null) => {
    try {
      const response = await disasterRecoveryService.getMetrics(appName);
      dispatch({ type: 'SET_METRICS', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await disasterRecoveryService.getDRStats();
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const createPlan = useCallback(async (data) => {
    try {
      const response = await disasterRecoveryService.createPlan(data);
      const newPlan = response.data;
      dispatch({ type: 'ADD_PLAN', payload: newPlan });
      return newPlan;
    } catch (error) {
      console.error('Failed to create DR plan:', error);
      throw error;
    }
  }, []);

  const updatePlan = useCallback(async (planId, data) => {
    try {
      const response = await disasterRecoveryService.updatePlan(planId, data);
      dispatch({ type: 'UPDATE_PLAN', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Failed to update DR plan:', error);
      throw error;
    }
  }, []);

  const executePlan = useCallback(async (planId, executionType = 'actual') => {
    try {
      const response = await disasterRecoveryService.executePlan(planId, executionType);
      const execution = response.data;
      dispatch({ type: 'ADD_EXECUTION', payload: execution });
      return execution;
    } catch (error) {
      console.error('Failed to execute DR plan:', error);
      throw error;
    }
  }, []);

  const runDrill = useCallback(async (planId) => {
    try {
      const response = await disasterRecoveryService.runDrill(planId);
      const execution = response.data;
      dispatch({ type: 'ADD_EXECUTION', payload: execution });
      return execution;
    } catch (error) {
      console.error('Failed to run DR drill:', error);
      throw error;
    }
  }, []);

  const performFailover = useCallback(async (executionId) => {
    try {
      const response = await disasterRecoveryService.failover(executionId);
      return response.data;
    } catch (error) {
      console.error('Failed to perform failover:', error);
      throw error;
    }
  }, []);

  const performFailback = useCallback(async (executionId) => {
    try {
      const response = await disasterRecoveryService.failback(executionId);
      return response.data;
    } catch (error) {
      console.error('Failed to perform failback:', error);
      throw error;
    }
  }, []);

  const updateFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const selectPlan = useCallback((plan) => {
    dispatch({ type: 'SET_SELECTED_PLAN', payload: plan });
  }, []);

  const selectExecution = useCallback((execution) => {
    dispatch({ type: 'SET_SELECTED_EXECUTION', payload: execution });
  }, []);

  const refresh = useCallback(() => {
    fetchPlans();
    fetchExecutions();
    fetchMetrics();
    fetchStats();
  }, [fetchPlans, fetchExecutions, fetchMetrics, fetchStats]);

  const value = {
    ...state,
    fetchPlans,
    fetchExecutions,
    fetchMetrics,
    fetchStats,
    createPlan,
    updatePlan,
    executePlan,
    runDrill,
    performFailover,
    performFailback,
    updateFilters,
    selectPlan,
    selectExecution,
    refresh
  };

  return <DRContext.Provider value={value}>{children}</DRContext.Provider>;
};

export const useDRContext = () => {
  const context = useContext(DRContext);
  if (!context) {
    throw new Error('useDRContext must be used within DRProvider');
  }
  return context;
};