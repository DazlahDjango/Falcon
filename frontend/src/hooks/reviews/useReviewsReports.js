// src/hooks/reviews/useReviewsReports.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectEmployeeSummary,
  selectTeamSummary,
  selectCycleStatsReport,
  selectPIPSummaryReport,
  selectCalibrationSummaryReport,
  selectRatingDistributionReport,
  selectReportExportData,
  selectReportsLoading,
  selectReportsError,
  selectReportsLastFetched,
} from '../../store/reviews/selectors';
import {
  fetchEmployeeSummary,
  fetchTeamSummary,
  fetchCycleStatsReport,
  fetchPIPSummaryReport,
  fetchCalibrationSummaryReport,
  fetchRatingDistributionReport,
  exportReport,
  resetReportState,
} from '../../store/reviews/slices/report.slice';
import { useReviewsPermissions } from './';

const useReviewsReports = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const employeeSummary = useSelector(selectEmployeeSummary);
  const teamSummary = useSelector(selectTeamSummary);
  const cycleStats = useSelector(selectCycleStatsReport);
  const pipSummary = useSelector(selectPIPSummaryReport);
  const calibrationSummary = useSelector(selectCalibrationSummaryReport);
  const ratingDistribution = useSelector(selectRatingDistributionReport);
  const exportData = useSelector(selectReportExportData);
  const loading = useSelector(selectReportsLoading);
  const error = useSelector(selectReportsError);
  const lastFetched = useSelector(selectReportsLastFetched);

  // Actions
  const getEmployeeSummary = useCallback(
    (employeeId, cycleId) => {
      if (!permissions.canViewReports) {
        throw new Error('You do not have permission to view reports');
      }
      return dispatch(fetchEmployeeSummary({ employeeId, cycleId }));
    },
    [dispatch, permissions.canViewReports]
  );

  const getTeamSummary = useCallback(
    (managerId, cycleId) => {
      if (!permissions.canViewReports) {
        throw new Error('You do not have permission to view reports');
      }
      return dispatch(fetchTeamSummary({ managerId, cycleId }));
    },
    [dispatch, permissions.canViewReports]
  );

  const getCycleStats = useCallback(
    (cycleId) => {
      if (!permissions.canViewReports) {
        throw new Error('You do not have permission to view reports');
      }
      return dispatch(fetchCycleStatsReport(cycleId));
    },
    [dispatch, permissions.canViewReports]
  );

  const getPIPSummary = useCallback(
    () => {
      if (!permissions.canViewReports) {
        throw new Error('You do not have permission to view reports');
      }
      return dispatch(fetchPIPSummaryReport());
    },
    [dispatch, permissions.canViewReports]
  );

  const getCalibrationSummary = useCallback(
    (cycleId) => {
      if (!permissions.canViewReports) {
        throw new Error('You do not have permission to view reports');
      }
      return dispatch(fetchCalibrationSummaryReport(cycleId));
    },
    [dispatch, permissions.canViewReports]
  );

  const getRatingDistribution = useCallback(
    (cycleId) => {
      if (!permissions.canViewReports) {
        throw new Error('You do not have permission to view reports');
      }
      return dispatch(fetchRatingDistributionReport(cycleId));
    },
    [dispatch, permissions.canViewReports]
  );

  const exportReport = useCallback(
    (reportType, cycleId, format) => {
      if (!permissions.canExportReports) {
        throw new Error('You do not have permission to export reports');
      }
      return dispatch(exportReport({ reportType, cycleId, format }));
    },
    [dispatch, permissions.canExportReports]
  );

  const reset = useCallback(
    () => dispatch(resetReportState()),
    [dispatch]
  );

  // Computed
  const canView = useMemo(
    () => permissions.canViewReports,
    [permissions.canViewReports]
  );

  const canExport = useMemo(
    () => permissions.canExportReports,
    [permissions.canExportReports]
  );

  return {
    // Data
    employeeSummary,
    teamSummary,
    cycleStats,
    pipSummary,
    calibrationSummary,
    ratingDistribution,
    exportData,
    loading,
    error,
    lastFetched,

    // Actions
    getEmployeeSummary,
    getTeamSummary,
    getCycleStats,
    getPIPSummary,
    getCalibrationSummary,
    getRatingDistribution,
    exportReport,
    reset,

    // Permissions
    canView,
    canExport,

    // Utilities
    hasData: !!(employeeSummary || teamSummary || cycleStats || pipSummary || calibrationSummary || ratingDistribution),
    hasExportData: !!exportData,
  };
};

export default useReviewsReports;