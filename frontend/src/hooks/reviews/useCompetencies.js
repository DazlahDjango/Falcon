// src/hooks/reviews/useCompetencies.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllCompetencies,
  selectCompetenciesLoading,
  selectCompetenciesError,
  selectSelectedCompetency,
  selectCompetencyUsageStats,
  selectActiveCompetenciesList,
  selectRequiredCompetenciesList,
  selectCompetenciesPagination,
  selectCompetenciesFilters,
  selectActiveCompetencies,
  selectRequiredCompetencies,
  selectCompetenciesByType,
} from '../../store/reviews/selectors';
import {
  fetchCompetencies,
  fetchCompetency,
  createCompetency,
  updateCompetency,
  patchCompetency,
  deleteCompetency,
  activateCompetency,
  deactivateCompetency,
  fetchActiveCompetencies,
  fetchRequiredCompetencies,
  fetchCompetenciesByType,
  fetchCompetencyUsageStats,
  resetCompetencyState,
  setCompetencyFilters,
  clearCompetencyFilters,
  setCompetencyPagination,
} from '../../store/reviews/slices/competency.slice';
import useReviewsPermissions from './useReviewsPermissions';
import { competencyService } from '../../services/reviews';

const useCompetencies = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllCompetencies);
  const loading = useSelector(selectCompetenciesLoading);
  const error = useSelector(selectCompetenciesError);
  const selected = useSelector(selectSelectedCompetency);
  const usageStats = useSelector(selectCompetencyUsageStats);
  const activeCompetenciesList = useSelector(selectActiveCompetenciesList);
  const requiredCompetenciesList = useSelector(selectRequiredCompetenciesList);
  const pagination = useSelector(selectCompetenciesPagination);
  const filters = useSelector(selectCompetenciesFilters);
  const activeCompetencies = useSelector(selectActiveCompetencies);
  const requiredCompetencies = useSelector(selectRequiredCompetencies);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchCompetencies(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchCompetency(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateCompetency) {
        throw new Error('You do not have permission to create competencies');
      }
      return dispatch(createCompetency(data));
    },
    [dispatch, permissions.canCreateCompetency]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateCompetency) {
        throw new Error('You do not have permission to update competencies');
      }
      return dispatch(updateCompetency({ id, data }));
    },
    [dispatch, permissions.canUpdateCompetency]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateCompetency) {
        throw new Error('You do not have permission to update competencies');
      }
      return dispatch(patchCompetency({ id, data }));
    },
    [dispatch, permissions.canUpdateCompetency]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteCompetency) {
        throw new Error('You do not have permission to delete competencies');
      }
      return dispatch(deleteCompetency(id));
    },
    [dispatch, permissions.canDeleteCompetency]
  );

  const cloneCompetency = useCallback(
    async (id) => {
      if (!permissions.canCreateCompetency) {
        throw new Error('You do not have permission to clone competencies');
      }
      const itemDetail = await competencyService.get(id);
      const clonedPayload = {
        name: `${itemDetail.name} (Copy)`,
        description: itemDetail.description,
        category: itemDetail.category,
        competency_type: itemDetail.competency_type,
        is_active: itemDetail.is_active,
        is_required: itemDetail.is_required,
        default_weight: itemDetail.default_weight
      };
      const result = await dispatch(createCompetency(clonedPayload)).unwrap();
      dispatch(fetchCompetencies({ page: pagination.currentPage, page_size: pagination.pageSize, ...filters }));
      return result;
    },
    [dispatch, permissions.canCreateCompetency, pagination, filters]
  );

  const activate = useCallback(
    (id) => {
      if (!permissions.canCreateCompetency) {
        throw new Error('You do not have permission to activate competencies');
      }
      return dispatch(activateCompetency(id));
    },
    [dispatch, permissions.canCreateCompetency]
  );

  const deactivate = useCallback(
    (id) => {
      if (!permissions.canCreateCompetency) {
        throw new Error('You do not have permission to deactivate competencies');
      }
      return dispatch(deactivateCompetency(id));
    },
    [dispatch, permissions.canCreateCompetency]
  );

  const getActive = useCallback(
    () => dispatch(fetchActiveCompetencies()),
    [dispatch]
  );

  const getRequired = useCallback(
    () => dispatch(fetchRequiredCompetencies()),
    [dispatch]
  );

  const getByType = useCallback(
    (type) => dispatch(fetchCompetenciesByType(type)),
    [dispatch]
  );

  const getUsageStats = useCallback(
    (id) => dispatch(fetchCompetencyUsageStats(id)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetCompetencyState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (payload) => dispatch(setCompetencyFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearCompetencyFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (payload) => dispatch(setCompetencyPagination(payload)),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageCompetencies,
    [permissions.canManageCompetencies]
  );

  const canView = useMemo(
    () => permissions.canViewCompetencies,
    [permissions.canViewCompetencies]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    usageStats,
    activeCompetenciesList,
    requiredCompetenciesList,
    pagination,
    filters,
    activeCompetencies,
    requiredCompetencies,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    createCompetency: create,
    update,
    updateCompetency: update,
    patch,
    remove,
    deleteCompetency: remove,

    // Actions
    activate,
    deactivate,
    getActive,
    getRequired,
    getByType,
    getUsageStats,
    cloneCompetency,
    reset,
    setFilters,
    clearFilters,
    setPagination,

    // Permissions
    canManage,
    canView,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    getByCategory: (categoryId) => data.filter((item) => item.category === categoryId),
  };
};

export default useCompetencies;