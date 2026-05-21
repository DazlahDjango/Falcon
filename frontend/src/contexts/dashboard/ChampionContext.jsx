// frontend/src/contexts/dashboard/ChampionContext.jsx

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEditableDashboard,
  fetchAvailableKPIs,
  fetchAssignedKPIs,
  fetchTemplates,
  updateDashboardConfig,
  addKPI,
  removeKPI,
  updateKPIWeights,
  updateKPITargets,
  createTemplate,
  applyTemplate,
  setTargetUserId,
  setPeriod,
  updateChampionData
} from '../../store/dashboard/slices/championDashboardSlice';
import { useDashboard } from './DashboardContext';

const ChampionContext = createContext(null);

const initialState = {
  availableKPIs: [],
  assignedKPIs: [],
  templates: [],
  targetUserId: null,
  period: 'current',
  selectedKPI: null,
  selectedTemplate: null,
  filters: { category: null, isActive: true }
};

function championReducer(state, action) {
  switch (action.type) {
    case 'SET_AVAILABLE_KPIS':
      return { ...state, availableKPIs: action.payload };
    case 'SET_ASSIGNED_KPIS':
      return { ...state, assignedKPIs: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'SET_TARGET_USER_ID':
      return { ...state, targetUserId: action.payload };
    case 'SET_PERIOD':
      return { ...state, period: action.payload };
    case 'SET_SELECTED_KPI':
      return { ...state, selectedKPI: action.payload };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'UPDATE_ASSIGNED_KPI':
      return {
        ...state,
        assignedKPIs: state.assignedKPIs.map(k => 
          k.id === action.payload.id ? { ...k, ...action.payload } : k
        )
      };
    case 'REMOVE_ASSIGNED_KPI':
      return {
        ...state,
        assignedKPIs: state.assignedKPIs.filter(k => k.id !== action.payload)
      };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
}

export const ChampionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(championReducer, initialState);
  const reduxDispatch = useDispatch();
  const { setActiveDashboard, refreshDashboard } = useDashboard();
  const dashboardState = useSelector((state) => state.championDashboard);

  const loadDashboard = useCallback(async () => {
    setActiveDashboard('champion');
    await refreshDashboard();
  }, [setActiveDashboard, refreshDashboard]);

  const loadEditableDashboard = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchEditableDashboard({ 
        targetUserId: state.targetUserId, 
        period: state.period 
      })).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to load editable dashboard:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, state.period]);

  const loadAvailableKPIs = useCallback(async () => {
    if (!state.targetUserId) return [];
    try {
      const result = await reduxDispatch(fetchAvailableKPIs(state.targetUserId)).unwrap();
      dispatch({ type: 'SET_AVAILABLE_KPIS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load available KPIs:', error);
      return [];
    }
  }, [reduxDispatch, state.targetUserId]);

  const loadAssignedKPIs = useCallback(async () => {
    if (!state.targetUserId) return [];
    try {
      const result = await reduxDispatch(fetchAssignedKPIs(state.targetUserId)).unwrap();
      dispatch({ type: 'SET_ASSIGNED_KPIS', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load assigned KPIs:', error);
      return [];
    }
  }, [reduxDispatch, state.targetUserId]);

  const loadTemplates = useCallback(async () => {
    try {
      const result = await reduxDispatch(fetchTemplates()).unwrap();
      dispatch({ type: 'SET_TEMPLATES', payload: result });
      return result;
    } catch (error) {
      console.error('Failed to load templates:', error);
      return [];
    }
  }, [reduxDispatch]);

  const handleUpdateConfig = useCallback(async (config) => {
    try {
      const result = await reduxDispatch(updateDashboardConfig({ 
        targetUserId: state.targetUserId, 
        config 
      })).unwrap();
      await loadAssignedKPIs();
      await loadEditableDashboard();
      return result;
    } catch (error) {
      console.error('Failed to update config:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, loadAssignedKPIs, loadEditableDashboard]);

  const handleAddKPI = useCallback(async (kpiId, weight = 1) => {
    try {
      const result = await reduxDispatch(addKPI({ 
        targetUserId: state.targetUserId, 
        kpiId, 
        weight 
      })).unwrap();
      await loadAssignedKPIs();
      await loadAvailableKPIs();
      return result;
    } catch (error) {
      console.error('Failed to add KPI:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, loadAssignedKPIs, loadAvailableKPIs]);

  const handleRemoveKPI = useCallback(async (kpiId) => {
    try {
      const result = await reduxDispatch(removeKPI({ 
        targetUserId: state.targetUserId, 
        kpiId 
      })).unwrap();
      await loadAssignedKPIs();
      await loadAvailableKPIs();
      return result;
    } catch (error) {
      console.error('Failed to remove KPI:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, loadAssignedKPIs, loadAvailableKPIs]);

  const handleUpdateWeights = useCallback(async (weights) => {
    try {
      const result = await reduxDispatch(updateKPIWeights({ 
        targetUserId: state.targetUserId, 
        weights 
      })).unwrap();
      await loadAssignedKPIs();
      return result;
    } catch (error) {
      console.error('Failed to update weights:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, loadAssignedKPIs]);

  const handleUpdateTargets = useCallback(async (targets, period = null) => {
    try {
      const result = await reduxDispatch(updateKPITargets({ 
        targetUserId: state.targetUserId, 
        targets, 
        period: period || state.period 
      })).unwrap();
      await loadEditableDashboard();
      return result;
    } catch (error) {
      console.error('Failed to update targets:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, state.period, loadEditableDashboard]);

  const handleCreateTemplate = useCallback(async (name, description, category, configuration) => {
    try {
      const result = await reduxDispatch(createTemplate({ 
        name, description, category, configuration 
      })).unwrap();
      await loadTemplates();
      return result;
    } catch (error) {
      console.error('Failed to create template:', error);
      return null;
    }
  }, [reduxDispatch, loadTemplates]);

  const handleApplyTemplate = useCallback(async (templateId) => {
    try {
      const result = await reduxDispatch(applyTemplate({ 
        templateId, 
        targetUserId: state.targetUserId 
      })).unwrap();
      await loadAssignedKPIs();
      await loadEditableDashboard();
      return result;
    } catch (error) {
      console.error('Failed to apply template:', error);
      return null;
    }
  }, [reduxDispatch, state.targetUserId, loadAssignedKPIs, loadEditableDashboard]);

  const setTargetUser = useCallback((userId) => {
    dispatch({ type: 'SET_TARGET_USER_ID', payload: userId });
    reduxDispatch(setTargetUserId(userId));
  }, [reduxDispatch]);

  const setPeriodFilter = useCallback((period) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
    reduxDispatch(setPeriod(period));
  }, [reduxDispatch]);

  const selectKPI = useCallback((kpi) => {
    dispatch({ type: 'SET_SELECTED_KPI', payload: kpi });
  }, []);

  const selectTemplate = useCallback((template) => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const updateDashboardData = useCallback((data) => {
    reduxDispatch(updateChampionData(data));
  }, [reduxDispatch]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadEditableDashboard(),
      loadAvailableKPIs(),
      loadAssignedKPIs(),
      loadTemplates()
    ]);
  }, [loadEditableDashboard, loadAvailableKPIs, loadAssignedKPIs, loadTemplates]);

  const value = {
    ...state,
    dashboardData: dashboardState?.data,
    loading: dashboardState?.loading,
    saving: dashboardState?.saving,
    creatingTemplate: dashboardState?.creatingTemplate,
    applyingTemplate: dashboardState?.applyingTemplate,
    error: dashboardState?.error,
    lastUpdated: dashboardState?.lastUpdated,
    loadDashboard,
    loadEditableDashboard,
    loadAvailableKPIs,
    loadAssignedKPIs,
    loadTemplates,
    updateConfig: handleUpdateConfig,
    addKPI: handleAddKPI,
    removeKPI: handleRemoveKPI,
    updateWeights: handleUpdateWeights,
    updateTargets: handleUpdateTargets,
    createTemplate: handleCreateTemplate,
    applyTemplate: handleApplyTemplate,
    setTargetUser,
    setPeriod: setPeriodFilter,
    selectKPI,
    selectTemplate,
    setFilters,
    resetFilters,
    updateDashboardData,
    loadAllData
  };

  return (
    <ChampionContext.Provider value={value}>
      {children}
    </ChampionContext.Provider>
  );
};

export const useChampion = () => {
  const context = useContext(ChampionContext);
  if (!context) {
    throw new Error('useChampion must be used within a ChampionProvider');
  }
  return context;
};