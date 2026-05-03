import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useStructureFilters = (initialFilters = {}, paramPrefix = 'filter') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState(initialFilters);
  // Sync filters with URL - URL takes precedence over local
  const filters = useMemo(() => {
    const urlFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith(paramPrefix)) {
        const filterKey = key.replace(`${paramPrefix}_`, '');
        urlFilters[filterKey] = value;
      }
    }
    return { ...localFilters, ...urlFilters };
  }, [searchParams, localFilters, paramPrefix]);
  // Set a single filter value
  const setFilter = useCallback((key, value) => {
    // Validate value type
    let processedValue = value;
    if (value === 'true') processedValue = true;
    if (value === 'false') processedValue = false;
    if (value === 'null' || value === 'undefined') processedValue = '';
    setLocalFilters(prev => ({ ...prev, [key]: processedValue }));
    const newSearchParams = new URLSearchParams(searchParams);
    if (processedValue === undefined || processedValue === null || processedValue === '' || processedValue === false) {
      newSearchParams.delete(`${paramPrefix}_${key}`);
    } else {
      newSearchParams.set(`${paramPrefix}_${key}`, String(processedValue));
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams, paramPrefix]);
  // Set multiple filters at once
  const setFilters = useCallback((newFilters) => {
    // Process and validate new filters
    const processedFilters = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      let processedValue = value;
      if (value === 'true') processedValue = true;
      if (value === 'false') processedValue = false;
      if (value === 'null' || value === 'undefined') processedValue = '';
      processedFilters[key] = processedValue;
    });
    setLocalFilters(prev => ({ ...prev, ...processedFilters }));
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(processedFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === false) {
        newSearchParams.delete(`${paramPrefix}_${key}`);
      } else {
        newSearchParams.set(`${paramPrefix}_${key}`, String(value));
      }
    });
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams, paramPrefix]);
  // Reset all filters to initial state
  const resetFilters = useCallback(() => {
    // Process initial filters to remove empty values
    const processedInitial = {};
    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        processedInitial[key] = value;
      }
    });
    setLocalFilters(initialFilters);
    const newSearchParams = new URLSearchParams();
    Object.entries(processedInitial).forEach(([key, value]) => {
      newSearchParams.set(`${paramPrefix}_${key}`, String(value));
    });
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams, paramPrefix, initialFilters]);
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => {
      if (v === undefined || v === null || v === '') return false;
      if (v === false) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });
  }, [filters]);
  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => {
      if (v === undefined || v === null || v === '') return false;
      if (v === false) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }).length;
  }, [filters]);
  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useDepartmentFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    is_active: '',
    sensitivity_level: '',
    parent_id: '',
  }, 'dept');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setActiveStatus: (value) => setFilter('is_active', value),
    setSensitivity: (value) => setFilter('sensitivity_level', value),
    setParent: (value) => setFilter('parent_id', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useTeamFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    is_active: '',
    department_id: '',
    parent_team_id: '',
    has_team_lead: '',
  }, 'team');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setActiveStatus: (value) => setFilter('is_active', value),
    setDepartment: (value) => setFilter('department_id', value),
    setParentTeam: (value) => setFilter('parent_team_id', value),
    setHasTeamLead: (value) => setFilter('has_team_lead', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const usePositionFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    level: '',
    grade: '',
    is_vacant: '',
    default_department_id: '',
    is_single_incumbent: '',
  }, 'pos');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setLevel: (value) => setFilter('level', value),
    setGrade: (value) => setFilter('grade', value),
    setVacantOnly: (value) => setFilter('is_vacant', value),
    setDepartment: (value) => setFilter('default_department_id', value),
    setSingleIncumbentOnly: (value) => setFilter('is_single_incumbent', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useEmploymentFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    employment_type: '',
    department_id: '',
    team_id: '',
    is_manager: '',
    is_executive: '',
    is_active: 'true',
    effective_from: '',
    effective_to: '',
  }, 'emp');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setEmploymentType: (value) => setFilter('employment_type', value),
    setDepartment: (value) => setFilter('department_id', value),
    setTeam: (value) => setFilter('team_id', value),
    setManagerOnly: (value) => setFilter('is_manager', value),
    setExecutiveOnly: (value) => setFilter('is_executive', value),
    setActiveStatus: (value) => setFilter('is_active', value),
    setEffectiveFrom: (value) => setFilter('effective_from', value),
    setEffectiveTo: (value) => setFilter('effective_to', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useReportingFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    relation_type: '',
    is_active: 'true',
    can_approve_kpi: '',
    can_conduct_review: '',
  }, 'rep');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setRelationType: (value) => setFilter('relation_type', value),
    setActiveStatus: (value) => setFilter('is_active', value),
    setCanApproveKpi: (value) => setFilter('can_approve_kpi', value),
    setCanConductReview: (value) => setFilter('can_conduct_review', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useCostCenterFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    category: '',
    fiscal_year: '',
    is_active: 'true',
    is_shared: '',
  }, 'cc');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setCategory: (value) => setFilter('category', value),
    setFiscalYear: (value) => setFilter('fiscal_year', value),
    setActiveStatus: (value) => setFilter('is_active', value),
    setSharedOnly: (value) => setFilter('is_shared', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useLocationFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    type: '',
    country: '',
    is_active: 'true',
    is_headquarters: '',
  }, 'loc');

  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setType: (value) => setFilter('type', value),
    setCountry: (value) => setFilter('country', value),
    setActiveStatus: (value) => setFilter('is_active', value),
    setHeadquartersOnly: (value) => setFilter('is_headquarters', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useHierarchyVersionFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    search: '',
    version_type: '',
    is_current: '',
  }, 'ver');
  return {
    filters,
    setSearch: (value) => setFilter('search', value),
    setVersionType: (value) => setFilter('version_type', value),
    setCurrentOnly: (value) => setFilter('is_current', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export const useOrgChartFilters = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
    include_inactive: 'false',
    max_depth: '10',
    chart_type: 'tree',
  }, 'chart');
  return {
    filters,
    setIncludeInactive: (value) => setFilter('include_inactive', value),
    setMaxDepth: (value) => setFilter('max_depth', value),
    setChartType: (value) => setFilter('chart_type', value),
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export default {
  useStructureFilters,
  useDepartmentFilters,
  useTeamFilters,
  usePositionFilters,
  useEmploymentFilters,
  useReportingFilters,
  useCostCenterFilters,
  useLocationFilters,
  useHierarchyVersionFilters,
  useOrgChartFilters,
};