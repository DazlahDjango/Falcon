// src/hooks/reviews/useReviewsReferenceData.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectReferenceData,
  selectReferenceDataUsers,
  selectReferenceDataDepartments,
  selectReferenceDataTeams,
  selectReferenceDataPositions,
  selectReferenceDataMetrics,
  selectReferenceDataLoading,
  selectReferenceDataError,
  selectReferenceDataLastFetched,
} from '../../store/reviews/selectors';
import {
  fetchReferenceData,
  fetchUsers,
  fetchDepartments,
  fetchTeams,
  fetchPositions,
  fetchMetrics,
  resetReferenceDataState,
} from '../../store/reviews/slices/referenceData.slice';
import { useReviewsPermissions } from './';

const useReviewsReferenceData = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectReferenceData);
  const users = useSelector(selectReferenceDataUsers);
  const departments = useSelector(selectReferenceDataDepartments);
  const teams = useSelector(selectReferenceDataTeams);
  const positions = useSelector(selectReferenceDataPositions);
  const metrics = useSelector(selectReferenceDataMetrics);
  const loading = useSelector(selectReferenceDataLoading);
  const error = useSelector(selectReferenceDataError);
  const lastFetched = useSelector(selectReferenceDataLastFetched);

  // Actions
  const getReferenceData = useCallback(
    (include) => {
      if (!permissions.canViewReferenceData) {
        throw new Error('You do not have permission to view reference data');
      }
      return dispatch(fetchReferenceData(include));
    },
    [dispatch, permissions.canViewReferenceData]
  );

  const getUsers = useCallback(
    () => {
      if (!permissions.canViewReferenceData) {
        throw new Error('You do not have permission to view users');
      }
      return dispatch(fetchUsers());
    },
    [dispatch, permissions.canViewReferenceData]
  );

  const getDepartments = useCallback(
    () => {
      if (!permissions.canViewReferenceData) {
        throw new Error('You do not have permission to view departments');
      }
      return dispatch(fetchDepartments());
    },
    [dispatch, permissions.canViewReferenceData]
  );

  const getTeams = useCallback(
    () => {
      if (!permissions.canViewReferenceData) {
        throw new Error('You do not have permission to view teams');
      }
      return dispatch(fetchTeams());
    },
    [dispatch, permissions.canViewReferenceData]
  );

  const getPositions = useCallback(
    () => {
      if (!permissions.canViewReferenceData) {
        throw new Error('You do not have permission to view positions');
      }
      return dispatch(fetchPositions());
    },
    [dispatch, permissions.canViewReferenceData]
  );

  const getMetrics = useCallback(
    () => {
      if (!permissions.canViewReferenceData) {
        throw new Error('You do not have permission to view metrics');
      }
      return dispatch(fetchMetrics());
    },
    [dispatch, permissions.canViewReferenceData]
  );

  const getAll = useCallback(
    () => getReferenceData(['users', 'departments', 'teams', 'positions', 'metrics']),
    [getReferenceData]
  );

  const reset = useCallback(
    () => dispatch(resetReferenceDataState()),
    [dispatch]
  );

  // Computed
  const canView = useMemo(
    () => permissions.canViewReferenceData,
    [permissions.canViewReferenceData]
  );

  return {
    // Data
    data,
    users,
    departments,
    teams,
    positions,
    metrics,
    loading,
    error,
    lastFetched,

    // Actions
    getReferenceData,
    getUsers,
    getDepartments,
    getTeams,
    getPositions,
    getMetrics,
    getAll,
    reset,

    // Permissions
    canView,

    // Utilities
    hasData: !!data,
    hasUsers: users.length > 0,
    hasDepartments: departments.length > 0,
    hasTeams: teams.length > 0,
    hasPositions: positions.length > 0,
    getUserById: (id) => users.find((user) => user.id === id),
    getDepartmentById: (id) => departments.find((dept) => dept.id === id),
    getTeamById: (id) => teams.find((team) => team.id === id),
    getPositionById: (id) => positions.find((pos) => pos.id === id),
  };
};

export default useReviewsReferenceData;