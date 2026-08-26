import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  unlockUser,
  assignUserRole,
  fetchUserTeam,
  fetchReportingChain,
  fetchMyTeam,
  fetchMyReportingChain,
  fetchInvitations,
  sendInvitation,
  setUserFilters,
  setUserPage,
  setUserPageSize,
  clearSelectedUser,
  clearUserError,
  verifyUser,
} from '../../store/accounts/slice/userSlice';
import { bulkImportUsers, bulkExportUsers } from '../../services/accounts/api/users';
import {
  selectUsers,
  selectSelectedUser,
  selectUsersLoading,
  selectUsersCreating,
  selectUsersUpdating,
  selectUsersDeleting,
  selectUsersError,
  selectUsersPagination,
  selectUsersFilters,
  selectUserTeam,
  selectReportingChain,
  selectMyTeam,
  selectMyReportingChain,
  selectInvitations,
  selectUserById,
  selectUsersByRole,
  selectActiveUsers,
  selectVerifiedUsers,
  selectUsersWithMFA,
} from '../../store/accounts/selectors/userSelectors';

export const useUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const selectedUser = useSelector(selectSelectedUser);
  const isLoading = useSelector(selectUsersLoading);
  const isCreating = useSelector(selectUsersCreating);
  const isUpdating = useSelector(selectUsersUpdating);
  const isDeleting = useSelector(selectUsersDeleting);
  const error = useSelector(selectUsersError);
  const pagination = useSelector(selectUsersPagination);
  const filters = useSelector(selectUsersFilters);
  const userTeam = useSelector(selectUserTeam);
  const reportingChain = useSelector(selectReportingChain);
  const myTeam = useSelector(selectMyTeam);
  const myReportingChain = useSelector(selectMyReportingChain);
  const invitations = useSelector(selectInvitations);

  const getUsers = useCallback(
    async (params) => {
      const result = await dispatch(fetchUsers(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUser = useCallback(
    async (id) => {
      const result = await dispatch(fetchUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const create = useCallback(
    async (data) => {
      const result = await dispatch(createUser(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const update = useCallback(
    async (id, data) => {
      const result = await dispatch(updateUser({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const remove = useCallback(
    async (id) => {
      const result = await dispatch(deleteUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const activate = useCallback(
    async (id) => {
      const result = await dispatch(activateUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const deactivate = useCallback(
    async (id) => {
      const result = await dispatch(deactivateUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const unlock = useCallback(
    async (id) => {
      const result = await dispatch(unlockUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const verify = useCallback(
    async (id) => {
      const result = await dispatch(verifyUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const assignRole = useCallback(
    async (id, role) => {
      const result = await dispatch(assignUserRole({ id, role })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTeam = useCallback(
    async (id) => {
      const result = await dispatch(fetchUserTeam(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getReportingChain = useCallback(
    async (id) => {
      const result = await dispatch(fetchReportingChain(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getMyTeam = useCallback(async () => {
    const result = await dispatch(fetchMyTeam()).unwrap();
    return result;
  }, [dispatch]);

  const getMyReportingChain = useCallback(async () => {
    const result = await dispatch(fetchMyReportingChain()).unwrap();
    return result;
  }, [dispatch]);

  const getInvitations = useCallback(async () => {
    const result = await dispatch(fetchInvitations()).unwrap();
    return result;
  }, [dispatch]);

  const invite = useCallback(
    async (data) => {
      const result = await dispatch(sendInvitation(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setUserFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setUserPage(page));
    },
    [dispatch]
  );

  const setPageSize = useCallback(
    (pageSize) => {
      dispatch(setUserPageSize(pageSize));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedUser());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const getUserById = useCallback(
    (id) => {
      return selectUserById({ users: { users } }, id);
    },
    [users]
  );

  const getUsersByRole = useCallback(
    (role) => {
      return selectUsersByRole({ users: { users } }, role);
    },
    [users]
  );

  const getFullName = useCallback((user) => {
    if (!user) return '';

    if (typeof user === 'string') return user;

    return (
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.email ||
      user.username ||
      ''
    );
  }, []);

  const importUsers = useCallback(async (formData) => {
    const response = await bulkImportUsers(formData);
    return response.data;
  }, []);

  const exportUsers = useCallback(async () => {
    const response = await bulkExportUsers();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  return useMemo(
    () => ({
      users,
      selectedUser,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      pagination,
      filters,
      userTeam,
      reportingChain,
      myTeam,
      myReportingChain,
      invitations,
      getUsers,
      loadUsers: getUsers,
      getUser,
      create,
      createUser: create,
      update,
      updateUser: update,
      remove,
      activate,
      deactivate,
      unlock,
      verify,
      assignRole,
      getTeam,
      getUserTeam: getTeam,
      getReportingChain,
      getMyTeam,
      getMyReportingChain,
      getInvitations,
      invite,
      sendInvitation: invite,
      importUsers,
      exportUsers,
      setFilters,
      setPage,
      setPageSize,
      clearSelected,
      clearSelectedUser: clearSelected,
      clearError,
      getUserById,
      getUsersByRole,
      getFullName,
    }),
    [
      users,
      selectedUser,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      pagination,
      filters,
      userTeam,
      reportingChain,
      myTeam,
      myReportingChain,
      invitations,
      getUsers,
      getUser,
      create,
      update,
      remove,
      activate,
      deactivate,
      unlock,
      verify,
      assignRole,
      getTeam,
      getReportingChain,
      getMyTeam,
      getMyReportingChain,
      getInvitations,
      invite,
      importUsers,
      exportUsers,
      setFilters,
      setPage,
      setPageSize,
      clearSelected,
      clearError,
      getUserById,
      getUsersByRole,
      getFullName,
    ]
  );
};
