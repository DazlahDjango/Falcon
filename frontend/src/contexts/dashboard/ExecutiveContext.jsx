import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExecutiveDashboard,
  fetchExecutiveDepartments,
  fetchExecutiveTrends,
  fetchExecutiveIssues,
  updateExecutiveData
} from '../../store/dashboard/slices/dashboardSlice';
import { useDashboard } from './DashboardContext';

const ExecutiveContext = createContext(null);

const initialState = {
  departments: [],
  trends: [],
  issues: [],
  selectedDepartment: null,
  selectedKpi: null,
  dateRange: { start: null, end: null },
  filters: { period: 'monthly', department: null, status: null }
};

function executiveReducer(state, action) {
  switch (action.type) {
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_TRENDS':
      return { ...state, trends: action.payload };
    case 'SET_ISSUES':
      return { ...state, issues: action.payload };
    case 'SET_SELECTED_DEPARTMENT':
      return { ...state, selectedDepartment: action.payload };
    case 'SET_SELECTED_KPI':
      return { ...state, selectedKpi: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters, dateRange: initialState.dateRange };
    default:
      return state;
  }
}

export const ExecutiveProvider = ({ children }) => {
  const [state, dispatch] = useReducer(executiveReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.dashboard?.executive);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('executive');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadDepartments = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchExecutiveDepartments()).unwrap();
      dispatch({ type: 'SET_DEPARTMENTS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load departments:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadTrends = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchExecutiveTrends()).unwrap();
      dispatch({ type: 'SET_TRENDS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load trends:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadIssues = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchExecutiveIssues()).unwrap();
      dispatch({ type: 'SET_ISSUES', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load issues:', error);
      return [];
    }
  }, [reduxDispatch]);

  const selectDepartment = useCallback((departmentId) => {
    dispatch({ type: 'SET_SELECTED_DEPARTMENT', payload: departmentId });
  }, []);

  const selectKpi = useCallback((kpiId) => {
    dispatch({ type: 'SET_SELECTED_KPI', payload: kpiId });
  }, []);

  const setDateRange = useCallback((range) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: range });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateExecutiveData(data));
  }, [reduxDispatch]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    loadDashboard,
    loadDepartments,
    loadTrends,
    loadIssues,
    selectDepartment,
    selectKpi,
    setDateRange,
    setFilters,
    resetFilters,
    updateDashboardData
  };

  return (
    <ExecutiveContext.Provider value={value}>
      {children}
    </ExecutiveContext.Provider>
  );
};

export const useExecutive = () => {
  const context = useContext(ExecutiveContext);
  if (!context) {
    throw new Error('useExecutive must be used within an ExecutiveProvider');
  }
  return context;
};