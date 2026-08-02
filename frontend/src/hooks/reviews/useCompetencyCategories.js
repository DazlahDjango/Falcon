// src/hooks/reviews/useCompetencyCategories.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllCompetencyCategories,
  selectCompetencyCategoriesLoading,
  selectCompetencyCategoryError,
  selectSelectedCompetencyCategory,
  selectCategoryCompetencies,
  selectActiveCompetencyCategories,
  selectCompetencyCategoryPagination,
  selectCompetencyCategoryFilters,
} from '../../store/reviews/selectors';
import {
  fetchCompetencyCategories,
  fetchCompetencyCategory,
  createCompetencyCategory,
  updateCompetencyCategory,
  deleteCompetencyCategory,
  activateCompetencyCategory,
  deactivateCompetencyCategory,
  fetchCategoryCompetencies,
  resetCategoryState,
  setCategoryFilters,
  clearCategoryFilters,
  setCategoryPagination,
} from '../../store/reviews/slices/competencyCategory.slice';
import { useReviewsPermissions } from './';

const useCompetencyCategories = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllCompetencyCategories);
  const loading = useSelector(selectCompetencyCategoriesLoading);
  const error = useSelector(selectCompetencyCategoryError);
  const selected = useSelector(selectSelectedCompetencyCategory);
  const categoryCompetencies = useSelector(selectCategoryCompetencies);
  const activeCategories = useSelector(selectActiveCompetencyCategories);
  const pagination = useSelector(selectCompetencyCategoryPagination);
  const filters = useSelector(selectCompetencyCategoryFilters);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchCompetencyCategories(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchCompetencyCategory(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateCompetencyCategory) {
        throw new Error('You do not have permission to create competency categories');
      }
      return dispatch(createCompetencyCategory(data));
    },
    [dispatch, permissions.canCreateCompetencyCategory]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateCompetencyCategory) {
        throw new Error('You do not have permission to update competency categories');
      }
      return dispatch(updateCompetencyCategory({ id, data }));
    },
    [dispatch, permissions.canUpdateCompetencyCategory]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteCompetencyCategory) {
        throw new Error('You do not have permission to delete competency categories');
      }
      return dispatch(deleteCompetencyCategory(id));
    },
    [dispatch, permissions.canDeleteCompetencyCategory]
  );

  const activate = useCallback(
    (id) => {
      if (!permissions.canCreateCompetencyCategory) {
        throw new Error('You do not have permission to activate competency categories');
      }
      return dispatch(activateCompetencyCategory(id));
    },
    [dispatch, permissions.canCreateCompetencyCategory]
  );

  const deactivate = useCallback(
    (id) => {
      if (!permissions.canCreateCompetencyCategory) {
        throw new Error('You do not have permission to deactivate competency categories');
      }
      return dispatch(deactivateCompetencyCategory(id));
    },
    [dispatch, permissions.canCreateCompetencyCategory]
  );

  const getCompetencies = useCallback(
    (id) => dispatch(fetchCategoryCompetencies(id)),
    [dispatch]
  );

  const setFilters = useCallback(
    (payload) => dispatch(setCategoryFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearCategoryFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (payload) => dispatch(setCategoryPagination(payload)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetCategoryState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageCompetencies,
    [permissions.canManageCompetencies]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    categoryCompetencies,
    activeCategories,
    pagination,
    filters,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    remove,

    // Actions
    activate,
    deactivate,
    getCompetencies,
    reset,
    setFilters,
    clearFilters,
    setPagination,

    // Permissions
    canManage,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
  };
};

export default useCompetencyCategories;