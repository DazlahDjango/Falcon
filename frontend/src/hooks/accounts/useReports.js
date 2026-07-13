import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserDirectoryReport,
  fetchRoleDistributionReport,
  fetchDepartmentDistributionReport,
  fetchInactiveUsersReport,
  fetchRecentlyAddedReport,
  fetchActivitySummaryReport,
  fetchAuditTrailReport,
  fetchLoginActivityReport,
  fetchPasswordChangesReport,
  fetchRoleChangesReport,
  fetchSuspensionLogReport,
  fetchComplianceSummaryReport,
  clearReportError,
  resetReports,
} from '../../store/accounts/slice/reportSlice';
import {
  selectReports,
  selectReportLoading,
  selectReportError,
  selectUserDirectoryReport,
  selectRoleDistributionReport,
  selectDepartmentDistributionReport,
  selectInactiveUsersReport,
  selectRecentlyAddedReport,
  selectActivitySummaryReport,
  selectAuditTrailReport,
  selectLoginActivityReport,
  selectPasswordChangesReport,
  selectRoleChangesReport,
  selectSuspensionLogReport,
  selectComplianceSummaryReport,
} from '../../store/accounts/selectors/reportSelectors';
import { exportReportFile } from '../../services/accounts/api/reports';

export const useReports = () => {
  const dispatch = useDispatch();

  const reports = useSelector(selectReports);
  const isLoading = useSelector(selectReportLoading);
  const error = useSelector(selectReportError);

  const userDirectory = useSelector(selectUserDirectoryReport);
  const roleDistribution = useSelector(selectRoleDistributionReport);
  const departmentDistribution = useSelector(selectDepartmentDistributionReport);
  const inactiveUsers = useSelector(selectInactiveUsersReport);
  const recentlyAdded = useSelector(selectRecentlyAddedReport);
  const activitySummary = useSelector(selectActivitySummaryReport);
  const auditTrail = useSelector(selectAuditTrailReport);
  const loginActivity = useSelector(selectLoginActivityReport);
  const passwordChanges = useSelector(selectPasswordChangesReport);
  const roleChanges = useSelector(selectRoleChangesReport);
  const suspensionLog = useSelector(selectSuspensionLogReport);
  const complianceSummary = useSelector(selectComplianceSummaryReport);

  const getUserDirectory = useCallback(
    async (params) => {
      const result = await dispatch(fetchUserDirectoryReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getRoleDistribution = useCallback(
    async (params) => {
      const result = await dispatch(fetchRoleDistributionReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getDepartmentDistribution = useCallback(
    async (params) => {
      const result = await dispatch(fetchDepartmentDistributionReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getInactiveUsers = useCallback(
    async (params) => {
      const result = await dispatch(fetchInactiveUsersReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getRecentlyAdded = useCallback(
    async (params) => {
      const result = await dispatch(fetchRecentlyAddedReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getActivitySummary = useCallback(
    async (params) => {
      const result = await dispatch(fetchActivitySummaryReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getAuditTrail = useCallback(
    async (params) => {
      const result = await dispatch(fetchAuditTrailReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getLoginActivity = useCallback(
    async (params) => {
      const result = await dispatch(fetchLoginActivityReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getPasswordChanges = useCallback(
    async (params) => {
      const result = await dispatch(fetchPasswordChangesReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getRoleChanges = useCallback(
    async (params) => {
      const result = await dispatch(fetchRoleChangesReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getSuspensionLog = useCallback(
    async (params) => {
      const result = await dispatch(fetchSuspensionLogReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getComplianceSummary = useCallback(
    async (params) => {
      const result = await dispatch(fetchComplianceSummaryReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const downloadReport = useCallback(
    async (endpoint, format, params) => {
      const response = await exportReportFile(endpoint, format, params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtensions = { csv: 'csv', xlsx: 'xlsx', pdf: 'pdf' };
      const extension = fileExtensions[format] || 'csv';
      
      link.setAttribute('download', `${endpoint}_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    []
  );

  const clearError = useCallback(() => {
    dispatch(clearReportError());
  }, [dispatch]);

  const resetAll = useCallback(() => {
    dispatch(resetReports());
  }, [dispatch]);

  return useMemo(
    () => ({
      reports,
      isLoading,
      error,
      userDirectory,
      roleDistribution,
      departmentDistribution,
      inactiveUsers,
      recentlyAdded,
      activitySummary,
      auditTrail,
      loginActivity,
      passwordChanges,
      roleChanges,
      suspensionLog,
      complianceSummary,
      getUserDirectory,
      getRoleDistribution,
      getDepartmentDistribution,
      getInactiveUsers,
      getRecentlyAdded,
      getActivitySummary,
      getAuditTrail,
      getLoginActivity,
      getPasswordChanges,
      getRoleChanges,
      getSuspensionLog,
      getComplianceSummary,
      downloadReport,
      clearError,
      resetAll,
    }),
    [
      reports,
      isLoading,
      error,
      userDirectory,
      roleDistribution,
      departmentDistribution,
      inactiveUsers,
      recentlyAdded,
      activitySummary,
      auditTrail,
      loginActivity,
      passwordChanges,
      roleChanges,
      suspensionLog,
      complianceSummary,
      getUserDirectory,
      getRoleDistribution,
      getDepartmentDistribution,
      getInactiveUsers,
      getRecentlyAdded,
      getActivitySummary,
      getAuditTrail,
      getLoginActivity,
      getPasswordChanges,
      getRoleChanges,
      getSuspensionLog,
      getComplianceSummary,
      downloadReport,
      clearError,
      resetAll,
    ]
  );
};
