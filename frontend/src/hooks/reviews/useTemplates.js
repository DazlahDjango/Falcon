// src/hooks/reviews/useTemplates.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllTemplates,
  selectTemplatesLoading,
  selectTemplatesError,
  selectSelectedTemplate,
  selectDefaultTemplate,
  selectActiveTemplatesList,
  selectDuplicatedTemplate,
  selectActiveTemplates,
  selectTemplatesPagination,
  selectTemplatesFilters,
} from '../../store/reviews/selectors';
import {
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  patchTemplate,
  deleteTemplate,
  setDefaultTemplate,
  activateTemplate,
  deactivateTemplate,
  duplicateTemplate,
  fetchDefaultTemplate,
  fetchActiveTemplates,
  resetTemplateState,
  setTemplateFilters,
  clearTemplateFilters,
  setTemplatePagination,
} from '../../store/reviews/slices/template.slice';
import { useReviewsPermissions } from './';

const useTemplates = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllTemplates);
  const loading = useSelector(selectTemplatesLoading);
  const error = useSelector(selectTemplatesError);
  const selected = useSelector(selectSelectedTemplate);
  const defaultTemplate = useSelector(selectDefaultTemplate);
  const activeTemplates = useSelector(selectActiveTemplates);
  const duplicatedTemplate = useSelector(selectDuplicatedTemplate);
  const pagination = useSelector(selectTemplatesPagination);
  const filters = useSelector(selectTemplatesFilters);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchTemplates(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchTemplate(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateTemplate) {
        throw new Error('You do not have permission to create templates');
      }
      return dispatch(createTemplate(data));
    },
    [dispatch, permissions.canCreateTemplate]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateTemplate) {
        throw new Error('You do not have permission to update templates');
      }
      return dispatch(updateTemplate({ id, data }));
    },
    [dispatch, permissions.canUpdateTemplate]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateTemplate) {
        throw new Error('You do not have permission to update templates');
      }
      return dispatch(patchTemplate({ id, data }));
    },
    [dispatch, permissions.canUpdateTemplate]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteTemplate) {
        throw new Error('You do not have permission to delete templates');
      }
      return dispatch(deleteTemplate(id));
    },
    [dispatch, permissions.canDeleteTemplate]
  );

  const setDefault = useCallback(
    (id) => {
      if (!permissions.canCreateTemplate) {
        throw new Error('You do not have permission to set default template');
      }
      return dispatch(setDefaultTemplate(id));
    },
    [dispatch, permissions.canCreateTemplate]
  );

  const activate = useCallback(
    (id) => {
      if (!permissions.canCreateTemplate) {
        throw new Error('You do not have permission to activate templates');
      }
      return dispatch(activateTemplate(id));
    },
    [dispatch, permissions.canCreateTemplate]
  );

  const deactivate = useCallback(
    (id) => {
      if (!permissions.canCreateTemplate) {
        throw new Error('You do not have permission to deactivate templates');
      }
      return dispatch(deactivateTemplate(id));
    },
    [dispatch, permissions.canCreateTemplate]
  );

  const duplicate = useCallback(
    (id) => {
      if (!permissions.canCreateTemplate) {
        throw new Error('You do not have permission to duplicate templates');
      }
      return dispatch(duplicateTemplate(id));
    },
    [dispatch, permissions.canCreateTemplate]
  );

  const getDefault = useCallback(
    () => dispatch(fetchDefaultTemplate()),
    [dispatch]
  );

  const getActive = useCallback(
    () => dispatch(fetchActiveTemplates()),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetTemplateState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => dispatch(setTemplateFilters(newFilters)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearTemplateFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (newPagination) => dispatch(setTemplatePagination(newPagination)),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageTemplates,
    [permissions.canManageTemplates]
  );

  const canView = useMemo(
    () => permissions.canViewTemplates,
    [permissions.canViewTemplates]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    defaultTemplate,
    activeTemplates,
    duplicatedTemplate,
    pagination,
    filters,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    patch,
    remove,

    // Actions
    setDefault,
    activate,
    deactivate,
    duplicate,
    getDefault,
    getActive,
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
    hasDefault: !!defaultTemplate,
    hasActiveTemplates: activeTemplates.length > 0,
  };
};

export default useTemplates;