import { createSelector } from '@reduxjs/toolkit';

const initialPagination = { page: 1, pageSize: 20, total: 0 };
const initialFilters = {};
const emptyArray = [];
const emptyObject = {};

export const selectUsersState = (state) => state.users || emptyObject;

export const selectUsers = createSelector(
  [selectUsersState],
  (usersState) => usersState?.users || emptyArray
);

export const selectSelectedUser = (state) => state.users?.selectedUser || null;

export const selectCurrentUser = (state) => state.users?.currentUser || null;

export const selectUserTeam = createSelector(
  [selectUsersState],
  (usersState) => usersState?.userTeam || emptyArray
);

export const selectReportingChain = createSelector(
  [selectUsersState],
  (usersState) => usersState?.reportingChain || emptyArray
);

export const selectMyTeam = createSelector(
  [selectUsersState],
  (usersState) => usersState?.myTeam || emptyArray
);

export const selectMyReportingChain = createSelector(
  [selectUsersState],
  (usersState) => usersState?.myReportingChain || emptyArray
);

export const selectInvitations = createSelector(
  [selectUsersState],
  (usersState) => usersState?.invitations || emptyArray
);

export const selectUsersLoading = (state) => state.users?.isLoading || false;

export const selectUsersCreating = (state) => state.users?.isCreating || false;

export const selectUsersUpdating = (state) => state.users?.isUpdating || false;

export const selectUsersDeleting = (state) => state.users?.isDeleting || false;

export const selectUsersError = (state) => state.users?.error || null;

export const selectUsersPagination = createSelector(
  [selectUsersState],
  (usersState) => usersState?.pagination || initialPagination
);

export const selectUsersPage = (state) => state.users?.pagination?.page || 1;

export const selectUsersPageSize = (state) => state.users?.pagination?.pageSize || 20;

export const selectUsersTotal = (state) => state.users?.pagination?.total || 0;

export const selectUsersTotalPages = createSelector(
  [selectUsersPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectUsersFilters = createSelector(
  [selectUsersState],
  (usersState) => usersState?.filters || initialFilters
);

export const selectUserById = createSelector(
  [selectUsers, (state, id) => id],
  (users, id) => users.find(u => u.id === id) || null
);

export const selectUserByEmail = createSelector(
  [selectUsers, (state, email) => email],
  (users, email) => users.find(u => u.email === email) || null
);

export const selectUsersByRole = createSelector(
  [selectUsers, (state, role) => role],
  (users, role) => users.filter(u => u.role === role)
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(u => u.is_active !== false)
);

export const selectVerifiedUsers = createSelector(
  [selectUsers],
  (users) => users.filter(u => u.is_verified === true)
);

export const selectUsersWithMFA = createSelector(
  [selectUsers],
  (users) => users.filter(u => u.mfa_enabled === true)
);

export const selectInvitationsCount = createSelector(
  [selectInvitations],
  (invitations) => invitations.length
);

export const selectHasTeam = createSelector(
  [selectMyTeam],
  (team) => team.length > 0
);