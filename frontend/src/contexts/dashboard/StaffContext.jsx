// frontend/src/contexts/dashboard/StaffContext.jsx

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStaffDashboard,
  fetchMyKPIs,
  fetchPendingSubmissions,
  fetchMissionStatus,
  fetchPendingTasks,
  submitKPI,
  updateMissionStatus,
  setPeriod,
  updateStaffData
} from '../../store/dashboard/slices/staffDashboardSlice';
import { useDashboard } from './DashboardContext';

const StaffContext = createContext(null);

const initialState = {
  myKPIs: [],
  pendingSubmissions: [],
  missionStatus: null,
  pendingTasks: [],
  period: 'current',
  selectedKPI: null,
  filters: { status: null, category: null }
};

function staffReducer(state, action) {
  switch (action.type) {
    case 'SET_MY_KPIS':
      return { ...state, myKPIs: action.payload };
    case 'SET_PENDING_SUBMISSIONS':
      return { ...state, pendingSubmissions: action.payload };
    case 'SET_MISSION_STATUS':
      return { ...state, missionStatus: action.payload };
    case 'SET_PENDING_TASKS':
      return { ...state, pendingTasks: action.payload };
    case 'SET_PERIOD':
      return { ...state, period: action.payload };
    case 'SET_SELECTED_KPI':
      return { ...state, selectedKPI: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'UPDATE_SUBMISSION_STATUS':
      return {
        ...state,
        pendingSubmissions: state.pendingSubmissions.filter(s => s.id !== action.payload)
      };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
}

export const StaffProvider = ({ children }) => {
  const [state, dispatch] = useReducer(staffReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.staffDashboard);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('staff');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadMyKPIs = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchMyKPIs(state.period)).unwrap();
      dispatch({ type: 'SET_MY_KPIS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load KPIs:', error);
      return [];
    }
  }, [reduxDispatch, state.period]);

  const loadPendingSubmissions = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchPendingSubmissions()).unwrap();
      dispatch({ type: 'SET_PENDING_SUBMISSIONS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load pending submissions:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadMissionStatus = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchMissionStatus(state.period)).unwrap();
      dispatch({ type: 'SET_MISSION_STATUS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load mission status:', error);
      return null;
    }
  }, [reduxDispatch, state.period]);

  const loadPendingTasks = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchPendingTasks()).unwrap();
      dispatch({ type: 'SET_PENDING_TASKS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  }, [reduxDispatch]);

  const handleSubmitKPI = useCallback(async (kpiId, value, comments = '') => {
    try {
      const result = await reduxDispatch(submitKPI({ kpiId, value, comments })).unwrap();
      await loadPendingSubmissions();
      await loadMyKPIs();
      return result;
    } catch (error) {
      console.error('Failed to submit KPI:', error);
      return null;
    }
  }, [reduxDispatch, loadPendingSubmissions, loadMyKPIs]);

  const handleUpdateMissionStatus = useCallback(async (missionData) => {
    try {
      const result = await reduxDispatch(updateMissionStatus(missionData)).unwrap();
      dispatch({ type: 'SET_MISSION_STATUS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to update mission status:', error);
      return null;
    }
  }, [reduxDispatch]);

  const selectKPI = useCallback((kpi) => {
    dispatch({ type: 'SET_SELECTED_KPI', payload: kpi });
  }, []);

  const setPeriodFilter = useCallback((period) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
    reduxDispatch(setPeriod(period));
  }, [reduxDispatch]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateStaffData(data));
  }, [reduxDispatch]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadMyKPIs(),
      loadPendingSubmissions(),
      loadMissionStatus(),
      loadPendingTasks()
    ]);
  }, [loadMyKPIs, loadPendingSubmissions, loadMissionStatus, loadPendingTasks]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    submitting: dashboardState?.submitting,
    updatingMission: dashboardState?.updatingMission,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    loadDashboard,
    loadMyKPIs,
    loadPendingSubmissions,
    loadMissionStatus,
    loadPendingTasks,
    submitKPI: handleSubmitKPI,
    updateMissionStatus: handleUpdateMissionStatus,
    selectKPI,
    setPeriod: setPeriodFilter,
    setFilters,
    resetFilters,
    updateDashboardData,
    loadAllData
  };

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};