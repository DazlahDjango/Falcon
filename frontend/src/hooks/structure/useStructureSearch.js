import { useQuery } from '@tanstack/react-query';
import { structureSearchService } from '../../services/structure/structureSearch.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { useState, useCallback, useMemo, useDeferredValue } from 'react';

export const useStructureSearch = (query, options = {}) => {
  const deferredQuery = useDeferredValue(query);
  const enabled = deferredQuery && deferredQuery.length >= 2;
  const { data, isLoading, error } = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_SEARCH, 'global', deferredQuery, options],
    queryFn: () => structureSearchService.globalSearch(deferredQuery, options),
    enabled,
    staleTime: 30 * 1000,
  });
  return {
    results: data?.data || [],
    isLoading: enabled && isLoading,
    hasResults: (data?.data?.length || 0) > 0,
    error,
  };
};

export const useDepartmentSearch = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading } = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_SEARCH, 'departments', deferredQuery],
    queryFn: () => structureSearchService.searchDepartments(deferredQuery),
    enabled: deferredQuery && deferredQuery.length >= 2,
    staleTime: 30 * 1000,
  });
  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);
  }, []);
  const clear = useCallback(() => {
    setQuery('');
  }, []);
  return {
    query,
    results: data?.data || [],
    isLoading,
    search,
    clear,
  };
};

export const useTeamSearch = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading } = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_SEARCH, 'teams', deferredQuery],
    queryFn: () => structureSearchService.searchTeams(deferredQuery),
    enabled: deferredQuery && deferredQuery.length >= 2,
    staleTime: 30 * 1000,
  });
  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);
  }, []);
  return {
    query,
    results: data?.data || [],
    isLoading,
    search,
  };
};

export const usePositionSearch = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading } = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_SEARCH, 'positions', deferredQuery],
    queryFn: () => structureSearchService.searchPositions(deferredQuery),
    enabled: deferredQuery && deferredQuery.length >= 2,
    staleTime: 30 * 1000,
  });
  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);
  }, []);
  return {
    query,
    results: data?.data || [],
    isLoading,
    search,
  };
};

export const useEmploymentSearch = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading } = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_SEARCH, 'employments', deferredQuery],
    queryFn: () => structureSearchService.searchEmployments(deferredQuery),
    enabled: deferredQuery && deferredQuery.length >= 2,
    staleTime: 30 * 1000,
  });
  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);
  }, []);
  return {
    query,
    results: data?.data || [],
    isLoading,
    search,
  };
};

export const useSearchSuggestions = (query, entityTypes = ['departments', 'teams', 'positions']) => {
  const deferredQuery = useDeferredValue(query);
  const enabled = deferredQuery && deferredQuery.length >= 2;
  const { data, isLoading } = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_SEARCH, 'suggestions', deferredQuery, entityTypes],
    queryFn: () => structureSearchService.getTypeahead(deferredQuery, entityTypes),
    enabled,
    staleTime: 15 * 1000,
  });
  const suggestions = useMemo(() => {
    if (!data?.data?.results) return [];
    return data.data.results.map(item => ({
      id: item.id,
      label: item.name || item.title,
      subLabel: `${item.type} • ${item.code || item.job_code}`,
      type: item.type,
      data: item,
    }));
  }, [data]);
  return {
    suggestions,
    isLoading: enabled && isLoading,
  };
};