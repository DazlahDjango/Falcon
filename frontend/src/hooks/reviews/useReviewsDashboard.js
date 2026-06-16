// src/hooks/reviews/useReviewsDashboard.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectStaffDashboard,
  selectSupervisorDashboard,
  selectExecutiveDashboard,
  selectAdminDashboard,
  selectDashboardMetrics,
  selectDashboardLoading,
  selectDashboardError,
  selectSelectedDashboard,
} from '../../store/reviews/selectors';
import {
  fetchStaffDashboard,
  fetchSupervisorDashboard,
  fetchExecutiveDashboard,
  fetchAdminDashboard,
  fetchDashboardMetrics,
  clearDashboards,
  setSelectedDashboard,
  clearErrors,
} from '../../store/reviews/slices/dashboard.slice';
import { useReviewsPermissions } from './';

const useReviewsDashboard = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const staff = useSelector(selectStaffDashboard);
  const supervisor = useSelector(selectSupervisorDashboard);
  const executive = useSelector(selectExecutiveDashboard);
  const admin = useSelector(selectAdminDashboard);
  const metrics = useSelector(selectDashboardMetrics);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const selected = useSelector(selectSelectedDashboard);

  // Actions
  const getStaffDashboard = useCallback(
    () => {
      if (!permissions.canViewStaffDashboard) {
        throw new Error('You do not have permission to view staff dashboard');
      }
      return dispatch(fetchStaffDashboard());
    },
    [dispatch, permissions.canViewStaffDashboard]
  );

  const getSupervisorDashboard = useCallback(
    () => {
      if (!permissions.canViewSupervisorDashboard) {
        throw new Error('You do not have permission to view supervisor dashboard');
      }
      return dispatch(fetchSupervisorDashboard());
    },
    [dispatch, permissions.canViewSupervisorDashboard]
  );

  const getExecutiveDashboard = useCallback(
    (departmentId) => {
      if (!permissions.canViewExecutiveDashboard) {
        throw new Error('You do not have permission to view executive dashboard');
      }
      return dispatch(fetchExecutiveDashboard(departmentId));
    },
    [dispatch, permissions.canViewExecutiveDashboard]
  );

  const getAdminDashboard = useCallback(
    () => {
      if (!permissions.canViewAdminDashboard) {
        throw new Error('You do not have permission to view admin dashboard');
      }
      return dispatch(fetchAdminDashboard());
    },
    [dispatch, permissions.canViewAdminDashboard]
  );

  const getMetrics = useCallback(
    () => dispatch(fetchDashboardMetrics()),
    [dispatch]
  );

  const clear = useCallback(
    () => dispatch(clearDashboards()),
    [dispatch]
  );

  const setSelected = useCallback(
    (dashboardType) => dispatch(setSelectedDashboard(dashboardType)),
    [dispatch]
  );

  const clearDashboardErrors = useCallback(
    () => dispatch(clearErrors()),
    [dispatch]
  );

  // Computed
  const canViewStaff = useMemo(
    () => permissions.canViewStaffDashboard,
    [permissions.canViewStaffDashboard]
  );

  const canViewSupervisor = useMemo(
    () => permissions.canViewSupervisorDashboard,
    [permissions.canViewSupervisorDashboard]
  );

  const canViewExecutive = useMemo(
    () => permissions.canViewExecutiveDashboard,
    [permissions.canViewExecutiveDashboard]
  );

  const canViewAdmin = useMemo(
    () => permissions.canViewAdminDashboard,
    [permissions.canViewAdminDashboard]
  );

  // Get the appropriate dashboard based on permissions
  const getDashboard = useCallback(() => {
    if (canViewAdmin && permissions.isAdmin) {
      return getAdminDashboard();
    } else if (canViewExecutive && permissions.isExecutive) {
      return getExecutiveDashboard();
    } else if (canViewSupervisor && permissions.isSupervisor) {
      return getSupervisorDashboard();
    } else if (canViewStaff) {
      return getStaffDashboard();
    }
    return null;
  }, [
    canViewAdmin,
    canViewExecutive,
    canViewSupervisor,
    canViewStaff,
    permissions.isAdmin,
    permissions.isExecutive,
    permissions.isSupervisor,
    getAdminDashboard,
    getExecutiveDashboard,
    getSupervisorDashboard,
    getStaffDashboard,
  ]);

  return {
    // Data
    staff,
    supervisor,
    executive,
    admin,
    metrics,
    loading,
    error,
    selected,

    // Actions
    getStaffDashboard,
    getSupervisorDashboard,
    getExecutiveDashboard,
    getAdminDashboard,
    getMetrics,
    getDashboard,
    clear,
    setSelected,
    clearErrors: clearDashboardErrors,

    // Permissions
    canViewStaff,
    canViewSupervisor,
    canViewExecutive,
    canViewAdmin,

    // Utilities
    hasData: !!(staff || supervisor || executive || admin || metrics),
    isAdmin: permissions.isAdmin,
    isExecutive: permissions.isExecutive,
    isSupervisor: permissions.isSupervisor,
  };
};

export default useReviewsDashboard;