// frontend/src/store/accounts/hooks/useAdminMFA.js
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    // System Settings
    fetchSystemSettings,
    updateSystemSettings,
    resetSystemSettings,
    syncAllTenantsPolicy,

    // Tenant MFA Policy
    fetchTenantMFAPolicy,
    updateTenantMFAPolicy,

    // User MFA Policy
    fetchAllUsersMFAPolicy,
    fetchUserMFAPolicy,
    updateUserMFAOverride,
    clearUserMFAOverride,
    fetchUserMFAStatus,

    // Admin MFA Reset
    resetUserMFA,
    clearUserDevices,
    fetchAdminMFAStatus,

    // Step-Up
    verifyStepUp,

    // Selectors
    selectAdminMfa,
    selectSystemSettings,
    selectSystemSettingsLoading,
    selectTenantPolicy,
    selectTenantPolicyLoading,
    selectUsersPolicy,
    selectUsersPolicyLoading,
    selectCurrentUserPolicy,
    selectUserMFAStatus,
    selectAdminMFAStatus,
    selectStepUpVerified,
    selectStepUpVerifying,
    selectResettingUserMFA,
    selectSyncingPolicy,

    // Actions
    clearAdminMfaErrors,
    clearStepUpVerification,
    setUsersFilters,
    setUsersPage,
    resetAdminMfaState,
} from '../../store/accounts/slice/adminMfaSlice';

export const useAdminMFA = () => {
    const dispatch = useDispatch();
    const adminMfaState = useSelector(selectAdminMfa);

    // Local UI state
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [resetReason, setResetReason] = useState('');
    const [stepUpOtp, setStepUpOtp] = useState('');
    const [stepUpAction, setStepUpAction] = useState(null);

    // ========== System Settings ==========

    const loadSystemSettings = useCallback(async () => {
        return await dispatch(fetchSystemSettings()).unwrap();
    }, [dispatch]);

    const updateSystemSettingsAction = useCallback(async (patch) => {
        return await dispatch(updateSystemSettings(patch)).unwrap();
    }, [dispatch]);

    const resetSystemSettingsAction = useCallback(async () => {
        return await dispatch(resetSystemSettings()).unwrap();
    }, [dispatch]);

    const syncPolicyToAllTenants = useCallback(async () => {
        return await dispatch(syncAllTenantsPolicy()).unwrap();
    }, [dispatch]);

    // ========== Tenant MFA Policy ==========

    const loadTenantMFAPolicy = useCallback(async () => {
        return await dispatch(fetchTenantMFAPolicy()).unwrap();
    }, [dispatch]);

    const updateTenantMFAPolicyAction = useCallback(async (mfa_required_roles) => {
        return await dispatch(updateTenantMFAPolicy(mfa_required_roles)).unwrap();
    }, [dispatch]);

    // ========== User MFA Policy ==========

    const loadAllUsersMFAPolicy = useCallback(async () => {
        return await dispatch(fetchAllUsersMFAPolicy()).unwrap();
    }, [dispatch]);

    const loadUserMFAPolicy = useCallback(async (userId) => {
        return await dispatch(fetchUserMFAPolicy(userId)).unwrap();
    }, [dispatch]);

    const updateUserMFAOverrideAction = useCallback(async (userId, mfa_required) => {
        return await dispatch(updateUserMFAOverride({ userId, mfa_required })).unwrap();
    }, [dispatch]);

    const clearUserMFAOverrideAction = useCallback(async (userId) => {
        return await dispatch(clearUserMFAOverride(userId)).unwrap();
    }, [dispatch]);

    const loadUserMFAStatus = useCallback(async (userId) => {
        return await dispatch(fetchUserMFAStatus(userId)).unwrap();
    }, [dispatch]);

    // ========== Admin MFA Reset ==========

    const resetUserMFAAction = useCallback(async (userId, reason = '') => {
        return await dispatch(resetUserMFA({ userId, reason })).unwrap();
    }, [dispatch]);

    const clearUserDevicesAction = useCallback(async (userId, deviceId = null) => {
        return await dispatch(clearUserDevices({ userId, deviceId })).unwrap();
    }, [dispatch]);

    const loadAdminMFAStatus = useCallback(async (userId) => {
        return await dispatch(fetchAdminMFAStatus(userId)).unwrap();
    }, [dispatch]);

    // ========== Step-Up Authentication ==========

    const verifyStepUpAction = useCallback(async (action, otp) => {
        const result = await dispatch(verifyStepUp({ action, otp })).unwrap();
        setStepUpVerified(true);
        setStepUpAction(action);
        return result;
    }, [dispatch]);

    const clearStepUp = useCallback(() => {
        dispatch(clearStepUpVerification());
        setStepUpOtp('');
        setStepUpAction(null);
    }, [dispatch]);

    // ========== Filters & Pagination ==========

    const updateUsersFilters = useCallback((filters) => {
        dispatch(setUsersFilters(filters));
    }, [dispatch]);

    const updateUsersPage = useCallback((page) => {
        dispatch(setUsersPage(page));
    }, [dispatch]);

    // ========== Utility ==========

    const clearErrors = useCallback(() => {
        dispatch(clearAdminMfaErrors());
    }, [dispatch]);

    const resetState = useCallback(() => {
        dispatch(resetAdminMfaState());
    }, [dispatch]);

    // ========== Computed Values ==========

    const filteredUsers = adminMfaState.usersPolicy.filter(user => {
        const filters = adminMfaState.usersFilters;
        if (filters.search && !user.email.toLowerCase().includes(filters.search.toLowerCase()) &&
            !user.first_name?.toLowerCase().includes(filters.search.toLowerCase()) &&
            !user.last_name?.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.role && user.role !== filters.role) return false;
        if (filters.mfa_enabled !== null && user.mfa_enabled !== filters.mfa_enabled) return false;
        if (filters.mfa_required_override !== null) {
            if (filters.mfa_required_override === 'none' && user.mfa_required_override !== null) return false;
            if (filters.mfa_required_override === 'required' && user.mfa_required_override !== true) return false;
            if (filters.mfa_required_override === 'exempt' && user.mfa_required_override !== false) return false;
        }
        return true;
    });

    const paginatedUsers = filteredUsers.slice(
        (adminMfaState.usersPage - 1) * adminMfaState.usersPageSize,
        adminMfaState.usersPage * adminMfaState.usersPageSize
    );

    // ========== Return ==========

    return {
        // State
        systemSettings: adminMfaState.systemSettings,
        systemSettingsLoading: adminMfaState.systemSettingsLoading,
        systemSettingsUpdating: adminMfaState.systemSettingsUpdating,
        systemSettingsError: adminMfaState.systemSettingsError,

        tenantPolicy: adminMfaState.tenantPolicy,
        tenantPolicyLoading: adminMfaState.tenantPolicyLoading,
        tenantPolicyUpdating: adminMfaState.tenantPolicyUpdating,

        usersPolicy: adminMfaState.usersPolicy,
        usersPolicyLoading: adminMfaState.usersPolicyLoading,
        filteredUsers,
        paginatedUsers,
        usersTotal: filteredUsers.length,
        usersPage: adminMfaState.usersPage,
        usersPageSize: adminMfaState.usersPageSize,
        usersFilters: adminMfaState.usersFilters,

        currentUserPolicy: adminMfaState.currentUserPolicy,
        currentUserPolicyLoading: adminMfaState.currentUserPolicyLoading,

        userMFAStatus: adminMfaState.userMFAStatus,
        userMFAStatusLoading: adminMfaState.userMFAStatusLoading,

        adminMFAStatus: adminMfaState.adminMFAStatus,
        adminMFAStatusLoading: adminMfaState.adminMFAStatusLoading,

        stepUpVerified: adminMfaState.stepUpVerified,
        stepUpVerifying: adminMfaState.stepUpVerifying,
        stepUpAction: adminMfaState.stepUpAction,

        resettingUserMFA: adminMfaState.resettingUserMFA,
        clearingDevices: adminMfaState.clearingDevices,
        syncingPolicy: adminMfaState.syncingPolicy,

        // UI State
        selectedUserId,
        setSelectedUserId,
        resetReason,
        setResetReason,
        stepUpOtp,
        setStepUpOtp,

        // Actions - System Settings
        loadSystemSettings,
        updateSystemSettings: updateSystemSettingsAction,
        resetSystemSettings: resetSystemSettingsAction,
        syncPolicyToAllTenants,

        // Actions - Tenant MFA Policy
        loadTenantMFAPolicy,
        updateTenantMFAPolicy: updateTenantMFAPolicyAction,

        // Actions - User MFA Policy
        loadAllUsersMFAPolicy,
        loadUserMFAPolicy,
        updateUserMFAOverride: updateUserMFAOverrideAction,
        clearUserMFAOverride: clearUserMFAOverrideAction,
        loadUserMFAStatus,

        // Actions - Admin MFA Reset
        resetUserMFA: resetUserMFAAction,
        clearUserDevices: clearUserDevicesAction,
        loadAdminMFAStatus,

        // Actions - Step-Up
        verifyStepUp: verifyStepUpAction,
        clearStepUp,

        // Actions - Filters
        updateUsersFilters,
        updateUsersPage,

        // Utilities
        clearErrors,
        resetState,
    };
};