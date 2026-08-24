// src/hooks/reviews/useSelfAssessment.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllSelfAssessments,
  selectSelfAssessmentsLoading,
  selectSelfAssessmentsError,
  selectSelectedSelfAssessment,
  selectMySelfAssessment,
  selectSelfAssessmentStats,
  selectPendingSelfAssessments,
  selectSubmittedSelfAssessments,
} from '../../store/reviews/selectors';
import {
  fetchSelfAssessments,
  fetchSelfAssessment,
  createSelfAssessment,
  updateSelfAssessment,
  patchSelfAssessment,
  deleteSelfAssessment,
  submitSelfAssessment,
  saveSelfAssessmentDraft,
  resetSelfAssessmentToDraft,
  softDeleteSelfAssessment,
  restoreSelfAssessment,
  fetchMySelfAssessment,
  fetchSelfAssessmentStats,
  resetSelfAssessmentState,
} from '../../store/reviews/slices/selfAssessment.slice';
import { useReviewsPermissions } from './';

const useSelfAssessment = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllSelfAssessments);
  const loading = useSelector(selectSelfAssessmentsLoading);
  const error = useSelector(selectSelfAssessmentsError);
  const selected = useSelector(selectSelectedSelfAssessment);
  const mySelfAssessment = useSelector(selectMySelfAssessment);
  const stats = useSelector(selectSelfAssessmentStats);
  const pendingAssessments = useSelector(selectPendingSelfAssessments);
  const submittedAssessments = useSelector(selectSubmittedSelfAssessments);
  const pagination = useSelector((state) => state.reviews?.selfAssessments?.pagination) || { currentPage: 1, pageSize: 10, totalPages: 1, totalItems: data.length };
  const filters = useSelector((state) => state.reviews?.selfAssessments?.filters) || {};

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchSelfAssessments(params)),
    [dispatch]
  );

  const setPagination = useCallback(
    (payload) => dispatch(selfAssessmentActions.setPagination(payload)),
    [dispatch]
  );

  const setFilters = useCallback(
    (payload) => dispatch(selfAssessmentActions.setFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(selfAssessmentActions.clearFilters()),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchSelfAssessment(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateSelfAssessment) {
        throw new Error('You do not have permission to create self assessments');
      }
      return dispatch(createSelfAssessment(data));
    },
    [dispatch, permissions.canCreateSelfAssessment]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateSelfAssessment) {
        throw new Error('You do not have permission to update self assessments');
      }
      return dispatch(updateSelfAssessment({ id, data }));
    },
    [dispatch, permissions.canUpdateSelfAssessment]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateSelfAssessment) {
        throw new Error('You do not have permission to update self assessments');
      }
      return dispatch(patchSelfAssessment({ id, data }));
    },
    [dispatch, permissions.canUpdateSelfAssessment]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteSelfAssessment) {
        throw new Error('You do not have permission to delete self assessments');
      }
      return dispatch(deleteSelfAssessment(id));
    },
    [dispatch, permissions.canDeleteSelfAssessment]
  );

  const submit = useCallback(
    (id) => {
      if (!permissions.canSubmitSelfAssessment) {
        throw new Error('You do not have permission to submit self assessments');
      }
      return dispatch(submitSelfAssessment(id));
    },
    [dispatch, permissions.canSubmitSelfAssessment]
  );

  const saveDraft = useCallback(
    (id, data) => {
      if (!permissions.canUpdateSelfAssessment) {
        throw new Error('You do not have permission to save self assessment drafts');
      }
      return dispatch(saveSelfAssessmentDraft({ id, data }));
    },
    [dispatch, permissions.canUpdateSelfAssessment]
  );

  const resetToDraft = useCallback(
    (id) => {
      if (!permissions.canUpdateSelfAssessment) {
        throw new Error('You do not have permission to reset self assessments');
      }
      return dispatch(resetSelfAssessmentToDraft(id));
    },
    [dispatch, permissions.canUpdateSelfAssessment]
  );

  const softDelete = useCallback(
    (id) => {
      if (!permissions.canDeleteSelfAssessment) {
        throw new Error('You do not have permission to delete self assessments');
      }
      return dispatch(softDeleteSelfAssessment(id));
    },
    [dispatch, permissions.canDeleteSelfAssessment]
  );

  const restore = useCallback(
    (id) => {
      if (!permissions.canDeleteSelfAssessment) {
        throw new Error('You do not have permission to restore self assessments');
      }
      return dispatch(restoreSelfAssessment(id));
    },
    [dispatch, permissions.canDeleteSelfAssessment]
  );

  const fetchMy = useCallback(
    () => dispatch(fetchMySelfAssessment()),
    [dispatch]
  );

  const getStats = useCallback(
    (cycleId) => dispatch(fetchSelfAssessmentStats(cycleId)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetSelfAssessmentState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canCreateSelfAssessment,
    [permissions.canCreateSelfAssessment]
  );

  const canSubmit = useMemo(
    () => permissions.canSubmitSelfAssessment,
    [permissions.canSubmitSelfAssessment]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    mySelfAssessment,
    myAssessment: mySelfAssessment,
    stats,
    pendingAssessments,
    submittedAssessments,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    patch,
    remove,

    // Actions
    submit,
    submitAssessment: submit,
    saveDraft,
    saveAssessment: saveDraft,
    resetToDraft,
    softDelete,
    restore,
    fetchMy,
    fetchMyAssessment: fetchMy,
    getStats,
    reset,

    // Permissions
    canManage,
    canSubmit,

    // Utilities
    pagination,
    filters,
    setPagination,
    setFilters,
    clearFilters,
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    hasSelfAssessment: !!mySelfAssessment,
    isSubmitted: mySelfAssessment?.status === 'submitted',
    isDraft: mySelfAssessment?.status === 'draft',
  };
};

export default useSelfAssessment;