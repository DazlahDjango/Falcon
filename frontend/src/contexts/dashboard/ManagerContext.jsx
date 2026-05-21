// frontend/src/contexts/dashboard/ManagerContext.jsx

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchManagerDashboard,
  fetchTeamMembers,
  fetchTeamSummary,
  fetchPendingApprovals,
  approveSubmission,
  rejectSubmission,
  drillDownToUser,
  updateManagerData,
  setPeriod,
  setIncludeTeam,
  resetDrillDown
} from '../../store/dashboard/slices/managerDashboardSlice';
import { useDashboard } from './DashboardContext';

const ManagerContext = createContext(null);

const initialState = {
  teamMembers: [],
  teamSummary: null,
  pendingApprovals: [],
  selectedTeamMember: null,
  period: 'current',
  includeTeam: true,
  drillDownUserId: null,
  filters: { status: null, department: null }
};

function managerReducer(state, action) {
  switch (action.type) {
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload };
    case 'SET_TEAM_SUMMARY':
      return { ...state, teamSummary: action.payload };
    case 'SET_PENDING_APPROVALS':
      return { ...state, pendingApprovals: action.payload };
    case 'SET_SELECTED_TEAM_MEMBER':
      return { ...state, selectedTeamMember: action.payload };
    case 'SET_PERIOD':
      return { ...state, period: action.payload };
    case 'SET_INCLUDE_TEAM':
      return { ...state, includeTeam: action.payload };
    case 'SET_DRILL_DOWN_USER_ID':
      return { ...state, drillDownUserId: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'UPDATE_PENDING_APPROVAL':
      return {
        ...state,
        pendingApprovals: state.pendingApprovals.filter(a => a.id !== action.payload)
      };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'RESET_DRILL_DOWN':
      return { ...state, drillDownUserId: null, selectedTeamMember: null };
    default:
      return state;
  }
}

export const ManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(managerReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.managerDashboard);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('manager');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadTeamMembers = useCallback(async (userId = null) => {
    try {
      const result = await reduxDispatch(fetchTeamMembers(userId)).unwrap();
      dispatch({ type: 'SET_TEAM_MEMBERS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load team members:', error);
      return [];
    }
  }, [reduxDispatch]);

  const loadTeamSummary = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchTeamSummary()).unwrap();
      dispatch({ type: 'SET_TEAM_SUMMARY', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load team summary:', error);
      return null;
    }
  }, [reduxDispatch]);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchPendingApprovals()).unwrap();
      dispatch({ type: 'SET_PENDING_APPROVALS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
      return [];
    }
  }, [reduxDispatch]);

  const handleApproveSubmission = useCallback(async (submissionId, comments = '') => {
    try {
      const result = await reduxDispatch(approveSubmission({ submissionId, comments })).unwrap();
      dispatch({ type: 'UPDATE_PENDING_APPROVAL', payload: submissionId });
      return result;
    } catch (error) {
      console.error('Failed to approve submission:', error);
      return null;
    }
  }, [reduxDispatch]);

  const handleRejectSubmission = useCallback(async (submissionId, comments) => {
    try {
      const result = await reduxDispatch(rejectSubmission({ submissionId, comments })).unwrap();
      dispatch({ type: 'UPDATE_PENDING_APPROVAL', payload: submissionId });
      return result;
    } catch (error) {
      console.error('Failed to reject submission:', error);
      return null;
    }
  }, [reduxDispatch]);

  const drillDown = useCallback(async (userId) => {
    try {
      const result = await reduxDispatch(drillDownToUser({ userId, period: state.period })).unwrap();
      dispatch({ type: 'SET_DRILL_DOWN_USER_ID', payload: userId });
      dispatch({ type: 'SET_SELECTED_TEAM_MEMBER', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to drill down:', error);
      return null;
    }
  }, [reduxDispatch, state.period]);

  const resetDrillDownView = useCallback(() => {
    reduxDispatch(resetDrillDown());
    dispatch({ type: 'RESET_DRILL_DOWN' });
  }, [reduxDispatch]);

  const selectTeamMember = useCallback((member) => {
    dispatch({ type: 'SET_SELECTED_TEAM_MEMBER', payload: member });
  }, []);

  const setPeriodFilter = useCallback((period) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
    reduxDispatch(setPeriod(period));
  }, [reduxDispatch]);

  const setIncludeTeamFilter = useCallback((includeTeam) => {
    dispatch({ type: 'SET_INCLUDE_TEAM', payload: includeTeam });
    reduxDispatch(setIncludeTeam(includeTeam));
  }, [reduxDispatch]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateManagerData(data));
  }, [reduxDispatch]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadTeamMembers(state.drillDownUserId),
      loadTeamSummary(),
      loadPendingApprovals()
    ]);
  }, [loadTeamMembers, loadTeamSummary, loadPendingApprovals, state.drillDownUserId]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    approving: dashboardState?.approving,
    rejecting: dashboardState?.rejecting,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    loadDashboard,
    loadTeamMembers,
    loadTeamSummary,
    loadPendingApprovals,
    approveSubmission: handleApproveSubmission,
    rejectSubmission: handleRejectSubmission,
    drillDown,
    resetDrillDown: resetDrillDownView,
    selectTeamMember,
    setPeriod: setPeriodFilter,
    setIncludeTeam: setIncludeTeamFilter,
    setFilters,
    resetFilters,
    updateDashboardData,
    loadAllData
  };

  return (
    <ManagerContext.Provider value={value}>
      {children}
    </ManagerContext.Provider>
  );
};

export const useManager = () => {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error('useManager must be used within a ManagerProvider');
  }
  return context;
};