// frontend/src/hooks/tenant/useProvision.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProvisioningList,
    fetchFailedProvisionings,
    fetchInProgressProvisionings,
    fetchProvisioningStatus,
    triggerProvisioning,
    retryProvisioning,
    rollbackProvisioning,
    clearCurrentProvision,
    clearProvisionError,
    clearActionError,
    setProvisionFilters,
    resetProvisionFilters,
} from '../../store/tenant/slice/provision.slice';
import {
    selectProvisioningList,
    selectFailedProvisionings,
    selectInProgressProvisionings,
    selectCurrentProvisioningStatus,
    selectProvisioningLoading,
    selectProvisioningActionLoading,
    selectProvisioningError,
    selectProvisioningActionError,
    selectProvisioningPagination,
    selectProvisioningFilters,
    selectFailedCount,
    selectInProgressCount,
    selectHasFailedProvisionings,
    selectHasInProgressProvisionings,
    selectIsCurrentOrgProvisioning,
    selectIsCurrentOrgProvisioned,
    selectIsCurrentOrgFailed,
    selectProvisioningHealthSummary,
    selectLastTriggered,
    selectLastRetried,
    selectLastRolledBack,
    selectCurrentProvisioningProgress,
    selectCurrentProvisioningCurrentStep,
    selectCurrentProvisioningSteps,
} from '../../store/tenant/selectors/provision.selectors';

/**
 * useProvision — Enterprise provisioning management hook.
 *
 * Provides read/write access to the provisioning Redux slice.
 * Follows the same pattern as useOrganizations, useDomains, etc.
 *
 * Usage:
 *   const { list, failed, trigger, retry, rollback } = useProvision();
 */
export const useProvision = () => {
    const dispatch = useDispatch();

    // ==================== State ====================

    const list = useSelector(selectProvisioningList);
    const failed = useSelector(selectFailedProvisionings);
    const inProgress = useSelector(selectInProgressProvisionings);
    const current = useSelector(selectCurrentProvisioningStatus);
    const loading = useSelector(selectProvisioningLoading);
    const actionLoading = useSelector(selectProvisioningActionLoading);
    const error = useSelector(selectProvisioningError);
    const actionError = useSelector(selectProvisioningActionError);
    const pagination = useSelector(selectProvisioningPagination);
    const filters = useSelector(selectProvisioningFilters);

    // Derived
    const failedCount = useSelector(selectFailedCount);
    const inProgressCount = useSelector(selectInProgressCount);
    const hasFailures = useSelector(selectHasFailedProvisionings);
    const hasInProgress = useSelector(selectHasInProgressProvisionings);
    const healthSummary = useSelector(selectProvisioningHealthSummary);

    // Current org derived
    const isCurrentProvisioning = useSelector(selectIsCurrentOrgProvisioning);
    const isCurrentProvisioned = useSelector(selectIsCurrentOrgProvisioned);
    const isCurrentFailed = useSelector(selectIsCurrentOrgFailed);
    const currentProgress = useSelector(selectCurrentProvisioningProgress);
    const currentStep = useSelector(selectCurrentProvisioningCurrentStep);
    const currentSteps = useSelector(selectCurrentProvisioningSteps);

    // Last actions
    const lastTriggered = useSelector(selectLastTriggered);
    const lastRetried = useSelector(selectLastRetried);
    const lastRolledBack = useSelector(selectLastRolledBack);

    // ==================== Actions ====================

    const fetchList = useCallback(
    (params = {}) => dispatch(fetchProvisioningList(params)).unwrap(),
    [dispatch]
  );

  const fetchFailed = useCallback(
    () => dispatch(fetchFailedProvisionings()).unwrap(),
    [dispatch]
  );

  const fetchInProgressList = useCallback(
    () => dispatch(fetchInProgressProvisionings()).unwrap(),
    [dispatch]
  );

  const getStatus = useCallback(
    (orgId) => dispatch(fetchProvisioningStatus(orgId)).unwrap(),
    [dispatch]
  );

  const trigger = useCallback(
    (orgId, force = false) => dispatch(triggerProvisioning({ orgId, force })).unwrap(),
    [dispatch]
  );

  const retry = useCallback(
    (orgId, force = false) => dispatch(retryProvisioning({ orgId, force })).unwrap(),
    [dispatch]
  );

  const rollback = useCallback(
    (orgId) => dispatch(rollbackProvisioning(orgId)).unwrap(),
    [dispatch]
  );

    // ==================== Utility ====================

    const clearCurrent = useCallback(
        () => dispatch(clearCurrentProvision()),
        [dispatch]
    );

    const clearErrors = useCallback(
        () => dispatch(clearProvisionError()),
        [dispatch]
    );

    const clearActionErrors = useCallback(
        () => dispatch(clearActionError()),
        [dispatch]
    );

    const updateFilters = useCallback(
        (newFilters) => dispatch(setProvisionFilters(newFilters)),
        [dispatch]
    );

    const resetFilters = useCallback(
        () => dispatch(resetProvisionFilters()),
        [dispatch]
    );

    return {
        // Lists
        list,
        failed,
        inProgress,
        current,

        // Loading / Error
        loading,
        actionLoading,
        error,
        actionError,

        // Pagination
        pagination,
        filters,

        // Counts
        failedCount,
        inProgressCount,

        // Derived booleans
        hasFailures,
        hasInProgress,
        healthSummary,

        // Current org helpers
        isCurrentProvisioning,
        isCurrentProvisioned,
        isCurrentFailed,
        currentProgress,
        currentStep,
        currentSteps,

        // Last action receipts
        lastTriggered,
        lastRetried,
        lastRolledBack,

        // Actions
        fetchList,
        fetchFailed,
        fetchInProgressList,
        getStatus,
        trigger,
        retry,
        rollback,

        // Utility
        clearCurrent,
        clearErrors,
        clearActionErrors,
        updateFilters,
        resetFilters,
    };
};

export default useProvision;
