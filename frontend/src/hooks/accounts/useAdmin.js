import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSystemStats,
    fetchAllUsers,
    deleteUserAdmin,
    suspendUser,
    activateUserAdmin,
    impersonateUser,
    forcePasswordReset,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
    createTenantWithAdmin,
    fetchSystemHealth,
    fetchSystemConfig,
    updateSystemConfig,
    clearCache,
    clearUserCache,
    clearTenantCache,
    initSystemRoles,
    initPermissions,
    clearError,
    resetAdmin,
    selectAdmin,
} from '../../store/accounts/slice/adminSlice';

export const useAdmin = () => {
    const dispatch = useDispatch();
    const adminState = useSelector(selectAdmin);

    // Local UI state
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedTenantId, setSelectedTenantId] = useState(null);
    const [tenantModalOpen, setTenantModalOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);

    // ========== System Stats ==========

    const loadSystemStats = useCallback(async () => {
        return await dispatch(fetchSystemStats()).unwrap();
    }, [dispatch]);

    // ========== User Management (Admin) ==========

    const loadAllUsersAdmin = useCallback(async (params = {}) => {
        return await dispatch(fetchAllUsers(params)).unwrap();
    }, [dispatch]);

    const deleteUserAdminAction = useCallback(async (userId) => {
        return await dispatch(deleteUserAdmin(userId)).unwrap();
    }, [dispatch]);

    const suspendUserAction = useCallback(async (userId) => {
        return await dispatch(suspendUser(userId)).unwrap();
    }, [dispatch]);

    const activateUserAdminAction = useCallback(async (userId) => {
        return await dispatch(activateUserAdmin(userId)).unwrap();
    }, [dispatch]);

    const impersonateUserAction = useCallback(async (userId) => {
        return await dispatch(impersonateUser(userId)).unwrap();
    }, [dispatch]);

    const forcePasswordResetAction = useCallback(async (userId) => {
        return await dispatch(forcePasswordReset(userId)).unwrap();
    }, [dispatch]);

    // ========== Tenant Management ==========

    const loadTenants = useCallback(async (params = {}) => {
        return await dispatch(fetchTenants(params)).unwrap();
    }, [dispatch]);

    const addTenant = useCallback(async (tenantData) => {
        const result = await dispatch(createTenant(tenantData)).unwrap();
        return result;
    }, [dispatch]);

    const editTenant = useCallback(async (tenantId, tenantData) => {
        return await dispatch(updateTenant({ id: tenantId, ...tenantData })).unwrap();
    }, [dispatch]);

    const removeTenant = useCallback(async (tenantId) => {
        return await dispatch(deleteTenant(tenantId)).unwrap();
    }, [dispatch]);

    const suspendTenantAction = useCallback(async (tenantId) => {
        return await dispatch(suspendTenant(tenantId)).unwrap();
    }, [dispatch]);

    const activateTenantAction = useCallback(async (tenantId) => {
        return await dispatch(activateTenant(tenantId)).unwrap();
    }, [dispatch]);

    const addTenantWithAdmin = useCallback(async (data) => {
        return await dispatch(createTenantWithAdmin(data)).unwrap();
    }, [dispatch]);

    // ========== System Management ==========

    const loadSystemHealth = useCallback(async () => {
        return await dispatch(fetchSystemHealth()).unwrap();
    }, [dispatch]);

    const loadSystemConfig = useCallback(async () => {
        return await dispatch(fetchSystemConfig()).unwrap();
    }, [dispatch]);

    const updateSystemConfigAction = useCallback(async (config) => {
        return await dispatch(updateSystemConfig(config)).unwrap();
    }, [dispatch]);

    const clearSystemCache = useCallback(async () => {
        return await dispatch(clearCache()).unwrap();
    }, [dispatch]);

    const clearUserCacheAction = useCallback(async (userId) => {
        return await dispatch(clearUserCache(userId)).unwrap();
    }, [dispatch]);

    const clearTenantCacheAction = useCallback(async (tenantId) => {
        return await dispatch(clearTenantCache(tenantId)).unwrap();
    }, [dispatch]);

    // ========== Initialization ==========

    const initializeSystemRoles = useCallback(async () => {
        return await dispatch(initSystemRoles()).unwrap();
    }, [dispatch]);

    const initializePermissions = useCallback(async () => {
        return await dispatch(initPermissions()).unwrap();
    }, [dispatch]);

    // ========== Utilities ==========

    const clearAdminError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const resetAdminState = useCallback(() => {
        dispatch(resetAdmin());
    }, [dispatch]);

    // ========== Computed Values ==========

    const getTenantStatusBadge = (tenant) => {
        if (!tenant.is_active) return { text: 'Suspended', variant: 'danger' };
        return { text: 'Active', variant: 'success' };
    };

    const getUserStatusBadge = (user) => {
        if (!user.is_active) return { text: 'Inactive', variant: 'danger' };
        if (user.locked_until) return { text: 'Locked', variant: 'warning' };
        return { text: 'Active', variant: 'success' };
    };

    // ========== Return ==========

    return {
        // State
        stats: adminState.stats,
        users: adminState.users,
        tenants: adminState.tenants,
        health: adminState.health,
        systemConfig: adminState.systemConfig,
        pagination: adminState.pagination,
        isLoading: adminState.isLoading,
        error: adminState.error,

        // UI State
        selectedUserId,
        setSelectedUserId,
        selectedTenantId,
        setSelectedTenantId,
        tenantModalOpen,
        setTenantModalOpen,
        userModalOpen,
        setUserModalOpen,

        // Actions - System Stats
        loadSystemStats,

        // Actions - User Management
        loadAllUsersAdmin,
        deleteUserAdminAction,
        suspendUserAction,
        activateUserAdminAction,
        impersonateUserAction,
        forcePasswordResetAction,

        // Actions - Tenant Management
        loadTenants,
        addTenant,
        editTenant,
        removeTenant,
        suspendTenantAction,
        activateTenantAction,
        addTenantWithAdmin,

        // Actions - System Management
        loadSystemHealth,
        loadSystemConfig,
        updateSystemConfigAction,
        clearSystemCache,
        clearUserCacheAction,
        clearTenantCacheAction,

        // Actions - Initialization
        initializeSystemRoles,
        initializePermissions,

        // Utilities
        clearAdminError,
        resetAdminState,

        // Computed Values
        getTenantStatusBadge,
        getUserStatusBadge,
    };
};