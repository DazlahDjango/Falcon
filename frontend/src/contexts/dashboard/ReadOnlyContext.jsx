// frontend/src/contexts/dashboard/ReadOnlyContext.jsx

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReadOnlyDashboard,
  setPeriod,
  setViewType,
  updateReadOnlyData
} from '../../store/dashboard/slices/readOnlyDashboardSlice';
import { useDashboard } from './DashboardContext';

const ReadOnlyContext = createContext(null);

const initialState = {
  period: 'current',
  viewType: 'executive',
  filters: { department: null }
};

function readOnlyReducer(state, action) {
  switch (action.type) {
    case 'SET_PERIOD':
      return { ...state, period: action.payload };
    case 'SET_VIEW_TYPE':
      return { ...state, viewType: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
}

export const ReadOnlyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(readOnlyReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.readOnlyDashboard);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('read_only');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadDashboardData = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchReadOnlyDashboard({ 
        period: state.period, 
        viewType: state.viewType 
      })).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      return null;
    }
  }, [reduxDispatch, state.period, state.viewType]);

  const setPeriodFilter = useCallback((period) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
    reduxDispatch(setPeriod(period));
  }, [reduxDispatch]);

  const setViewTypeFilter = useCallback((viewType) => {
    dispatch({ type: 'SET_VIEW_TYPE', payload: viewType });
    reduxDispatch(setViewType(viewType));
  }, [reduxDispatch]);

  const switchToExecutiveView = useCallback(() => {
    setViewTypeFilter('executive');
  }, [setViewTypeFilter]);

  const switchToManagerView = useCallback(() => {
    setViewTypeFilter('manager');
  }, [setViewTypeFilter]);

  const switchToStaffView = useCallback(() => {
    setViewTypeFilter('staff');
  }, [setViewTypeFilter]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateReadOnlyData(data));
  }, [reduxDispatch]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    isReadOnly: true,
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canConfigure: false,
    loadDashboard,
    loadDashboardData,
    setPeriod: setPeriodFilter,
    setViewType: setViewTypeFilter,
    switchToExecutiveView,
    switchToManagerView,
    switchToStaffView,
    setFilters,
    resetFilters,
    updateDashboardData
  };

  return (
    <ReadOnlyContext.Provider value={value}>
      {children}
    </ReadOnlyContext.Provider>
  );
};

export const useReadOnly = () => {
  const context = useContext(ReadOnlyContext);
  if (!context) {
    throw new Error('useReadOnly must be used within a ReadOnlyProvider');
  }
  return context;
};