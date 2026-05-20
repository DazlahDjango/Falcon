import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { hierarchyService } from '../../services/dashboard/hierarchy.service';

const HierarchyContext = createContext(null);

const initialState = {
  team: [],
  teamAggregate: null,
  orgTree: null,
  reportingChain: [],
  selectedUser: null,
  loading: false,
  error: null
};

function hierarchyReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TEAM':
      return { ...state, team: action.payload, loading: false };
    case 'SET_TEAM_AGGREGATE':
      return { ...state, teamAggregate: action.payload };
    case 'SET_ORG_TREE':
      return { ...state, orgTree: action.payload };
    case 'SET_REPORTING_CHAIN':
      return { ...state, reportingChain: action.payload };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export const HierarchyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hierarchyReducer, initialState);

  const fetchTeam = useCallback(async (userId = null, includeSelf = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await hierarchyService.getTeam(userId, includeSelf);
      if (result?.success) {
        dispatch({ type: 'SET_TEAM', payload: result.data });
        return result.data;
      }
      throw new Error(result?.message || 'Failed to fetch team');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return [];
    }
  }, []);

  const fetchTeamAggregate = useCallback(async (userId = null) => {
    try {
      const result = await hierarchyService.getTeamAggregate(userId);
      if (result?.success) {
        dispatch({ type: 'SET_TEAM_AGGREGATE', payload: result.data });
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch team aggregate:', error);
      return null;
    }
  }, []);

  const fetchOrgTree = useCallback(async (rootUserId = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await hierarchyService.getOrgTree(rootUserId);
      if (result?.success) {
        dispatch({ type: 'SET_ORG_TREE', payload: result.data });
        return result.data;
      }
      throw new Error(result?.message || 'Failed to fetch org tree');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  }, []);

  const fetchReportingChain = useCallback(async (userId = null, includeSelf = false) => {
    try {
      const result = await hierarchyService.getReportingChain(userId, includeSelf);
      if (result?.success) {
        dispatch({ type: 'SET_REPORTING_CHAIN', payload: result.data.chain || result.data });
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch reporting chain:', error);
      return [];
    }
  }, []);

  const drillDown = useCallback(async (targetUserId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await hierarchyService.drillDown(targetUserId);
      if (result?.success) {
        dispatch({ type: 'SET_SELECTED_USER', payload: result.data });
        return result.data;
      }
      throw new Error(result?.message || 'Failed to drill down');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  }, []);

  const selectUser = useCallback((user) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
  }, []);

  const clearSelectedUser = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_USER', payload: null });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const refreshHierarchy = useCallback(async (userId = null) => {
    await Promise.all([
      fetchTeam(userId),
      fetchTeamAggregate(userId),
      fetchOrgTree(),
      fetchReportingChain(userId)
    ]);
  }, [fetchTeam, fetchTeamAggregate, fetchOrgTree, fetchReportingChain]);

  const value = {
    ...state,
    fetchTeam,
    fetchTeamAggregate,
    fetchOrgTree,
    fetchReportingChain,
    drillDown,
    selectUser,
    clearSelectedUser,
    clearError,
    refreshHierarchy
  };

  return (
    <HierarchyContext.Provider value={value}>
      {children}
    </HierarchyContext.Provider>
  );
};

export const useHierarchy = () => {
  const context = useContext(HierarchyContext);
  if (!context) {
    throw new Error('useHierarchy must be used within a HierarchyProvider');
  }
  return context;
};