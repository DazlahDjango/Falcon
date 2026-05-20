import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const DashboardFilterContext = createContext(null);

const initialState = {
  period: 'monthly',
  dateRange: {
    start: null,
    end: null
  },
  departments: [],
  kpiCategories: [],
  status: null,
  search: '',
  customFilters: {}
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_PERIOD':
      return { ...state, period: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_KPI_CATEGORIES':
      return { ...state, kpiCategories: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_CUSTOM_FILTER':
      return {
        ...state,
        customFilters: { ...state.customFilters, [action.payload.key]: action.payload.value }
      };
    case 'REMOVE_CUSTOM_FILTER':
      const newFilters = { ...state.customFilters };
      delete newFilters[action.payload];
      return { ...state, customFilters: newFilters };
    case 'RESET_FILTERS':
      return initialState;
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

export const DashboardFilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const setPeriod = useCallback((period) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
  }, []);

  const setDateRange = useCallback((dateRange) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: dateRange });
  }, []);

  const setDepartments = useCallback((departments) => {
    dispatch({ type: 'SET_DEPARTMENTS', payload: departments });
  }, []);

  const setKpiCategories = useCallback((categories) => {
    dispatch({ type: 'SET_KPI_CATEGORIES', payload: categories });
  }, []);

  const setStatus = useCallback((status) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  }, []);

  const setSearch = useCallback((search) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, []);

  const setCustomFilter = useCallback((key, value) => {
    dispatch({ type: 'SET_CUSTOM_FILTER', payload: { key, value } });
  }, []);

  const removeCustomFilter = useCallback((key) => {
    dispatch({ type: 'REMOVE_CUSTOM_FILTER', payload: key });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      state.period !== 'monthly' ||
      state.dateRange.start !== null ||
      state.departments.length > 0 ||
      state.kpiCategories.length > 0 ||
      state.status !== null ||
      state.search !== '' ||
      Object.keys(state.customFilters).length > 0
    );
  }, [state]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.period !== 'monthly') count++;
    if (state.dateRange.start !== null) count++;
    count += state.departments.length;
    count += state.kpiCategories.length;
    if (state.status !== null) count++;
    if (state.search !== '') count++;
    count += Object.keys(state.customFilters).length;
    return count;
  }, [state]);

  const getFilterParams = useCallback(() => {
    const params = {};
    if (state.period && state.period !== 'monthly') params.period = state.period;
    if (state.dateRange.start) params.date_from = state.dateRange.start.toISOString().split('T')[0];
    if (state.dateRange.end) params.date_to = state.dateRange.end.toISOString().split('T')[0];
    if (state.departments.length > 0) params.department_ids = state.departments.join(',');
    if (state.kpiCategories.length > 0) params.categories = state.kpiCategories.join(',');
    if (state.status) params.status = state.status;
    if (state.search) params.search = state.search;
    Object.assign(params, state.customFilters);
    return params;
  }, [state]);

  const value = {
    ...state,
    hasActiveFilters,
    activeFilterCount,
    setPeriod,
    setDateRange,
    setDepartments,
    setKpiCategories,
    setStatus,
    setSearch,
    setCustomFilter,
    removeCustomFilter,
    resetFilters,
    clearAllFilters,
    getFilterParams
  };

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilter = () => {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error('useDashboardFilter must be used within a DashboardFilterProvider');
  }
  return context;
};