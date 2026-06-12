import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    unlockUser,
    assignRole,
    changeUserPassword,
    inviteUser,
    resendInvitation,
    cancelInvitation,
    setFilters,
    resetFilters,
    setPage,
    clearSelectedUser,
    clearError,
    selectUsers,
} from '../../store/accounts/slice/userSlice';

export const useUsers = () => {
    const dispatch = useDispatch();
    const usersState = useSelector(selectUsers) || {
        users: [],
        selectedUser: null,
        pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            page_size: 20
        },
        filters: {
            search: '',
            role: '',
            is_active: undefined,
            is_verified: undefined,
            mfa_enabled: undefined,
            department_id: '',
            joined_after: '',
            joined_before: ''
        },
        isLoading: false,
        error: null,
        invitations: [],
        invitationLoading: false
    };

    // Local UI state
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    // ========== Data Fetching ==========

    const loadUsers = useCallback(async (params = {}) => {
        return await dispatch(fetchUsers(params)).unwrap();
    }, [dispatch]);

    const loadUserById = useCallback(async (userId) => {
        setSelectedUserId(userId);
        return await dispatch(fetchUserById(userId)).unwrap();
    }, [dispatch]);

    // ========== CRUD Operations ==========

    const addUser = useCallback(async (userData) => {
        const result = await dispatch(createUser(userData)).unwrap();
        return result;
    }, [dispatch]);

    const editUser = useCallback(async (userId, userData) => {
        const result = await dispatch(updateUser({ id: userId, ...userData })).unwrap();
        return result;
    }, [dispatch]);

    const removeUser = useCallback(async (userId) => {
        return await dispatch(deleteUser(userId)).unwrap();
    }, [dispatch]);

    // ========== User Actions ==========

    const activateUserAccount = useCallback(async (userId) => {
        return await dispatch(activateUser(userId)).unwrap();
    }, [dispatch]);

    const deactivateUserAccount = useCallback(async (userId) => {
        return await dispatch(deactivateUser(userId)).unwrap();
    }, [dispatch]);

    const unlockUserAccount = useCallback(async (userId) => {
        return await dispatch(unlockUser(userId)).unwrap();
    }, [dispatch]);

    const assignUserRole = useCallback(async (userId, role) => {
        return await dispatch(assignRole({ userId, role })).unwrap();
    }, [dispatch]);

    const changeUserPasswordAction = useCallback(async (userId, oldPassword, newPassword) => {
        return await dispatch(changeUserPassword({ userId, oldPassword, newPassword })).unwrap();
    }, [dispatch]);

    // ========== Invitations ==========

    const sendInvitation = useCallback(async (inviteData) => {
        return await dispatch(inviteUser(inviteData)).unwrap();
    }, [dispatch]);

    const resendUserInvitation = useCallback(async (invitationId) => {
        return await dispatch(resendInvitation(invitationId)).unwrap();
    }, [dispatch]);

    const cancelUserInvitation = useCallback(async (invitationId) => {
        return await dispatch(cancelInvitation(invitationId)).unwrap();
    }, [dispatch]);

    // ========== Filters & Pagination ==========

    const updateFilters = useCallback((filters) => {
        dispatch(setFilters(filters));
    }, [dispatch]);

    const clearAllFilters = useCallback(() => {
        dispatch(resetFilters());
    }, [dispatch]);

    const goToPage = useCallback((page) => {
        dispatch(setPage(page));
    }, [dispatch]);

    // ========== Utilities ==========

    const clearUserError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const clearUserSelection = useCallback(() => {
        dispatch(clearSelectedUser());
        setSelectedUserId(null);
    }, [dispatch]);

    // ========== Computed Values ==========

    const getFullName = (user) => {
        return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email;
    };

    const getUserRoleLabel = (role) => {
        const roleLabels = {
            super_admin: 'Super Admin',
            client_admin: 'Client Admin',
            executive: 'Executive',
            supervisor: 'Supervisor',
            dashboard_champion: 'Dashboard Champion',
            staff: 'Staff',
            read_only: 'Read Only',
        };
        return roleLabels[role] || role;
    };

    // ========== Return ==========

    return {
        // State
        users: usersState.users,
        selectedUser: usersState.selectedUser,
        pagination: usersState.pagination,
        filters: usersState.filters,
        isLoading: usersState.isLoading,
        error: usersState.error,
        invitations: usersState.invitations,
        invitationLoading: usersState.invitationLoading,

        // UI State
        selectedUserId,
        setSelectedUserId,
        inviteModalOpen,
        setInviteModalOpen,
        roleModalOpen,
        setRoleModalOpen,
        selectedRole,
        setSelectedRole,

        // Actions - Data Fetching
        loadUsers,
        loadUserById,

        // Actions - CRUD
        addUser,
        editUser,
        removeUser,

        // Actions - User Management
        activateUserAccount,
        deactivateUserAccount,
        unlockUserAccount,
        assignUserRole,
        changeUserPasswordAction,

        // Actions - Invitations
        sendInvitation,
        resendUserInvitation,
        cancelUserInvitation,

        // Actions - Filters
        updateFilters,
        clearAllFilters,
        goToPage,

        // Utilities
        clearUserError,
        clearUserSelection,
        getFullName,
        getUserRoleLabel,
    };
};