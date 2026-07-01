import { request } from './client';
import { USER_ENDPOINTS, USER_NESTED_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getUsers = (params) => request.get(USER_ENDPOINTS.LIST, { params });

export const getUser = (id) => request.get(USER_ENDPOINTS.DETAIL(id));

export const createUser = (data) => request.post(USER_ENDPOINTS.CREATE, data);

export const updateUser = (id, data) => request.patch(USER_ENDPOINTS.UPDATE(id), data);

export const deleteUser = (id) => request.delete(USER_ENDPOINTS.DELETE(id));

export const changeUserPassword = (id, data) =>
  request.post(USER_ENDPOINTS.CHANGE_PASSWORD(id), data);

export const assignUserRole = (id, data) =>
  request.post(USER_ENDPOINTS.ASSIGN_ROLE(id), data);

export const activateUser = (id) => request.post(USER_ENDPOINTS.ACTIVATE(id));

export const deactivateUser = (id) => request.post(USER_ENDPOINTS.DEACTIVATE(id));

export const unlockUser = (id) => request.post(USER_ENDPOINTS.UNLOCK(id));

export const getUserTeam = (id) => request.get(USER_ENDPOINTS.TEAM(id));

export const getUserReportingChain = (id) => request.get(USER_ENDPOINTS.REPORTING_CHAIN(id));

export const getMe = () => request.get(USER_ENDPOINTS.ME);

export const getMyTeam = () => request.get(USER_ENDPOINTS.MY_TEAM);

export const getMyReportingChain = () => request.get(USER_ENDPOINTS.MY_REPORTING_CHAIN);

export const inviteUser = (data) => request.post(USER_ENDPOINTS.INVITE, data);

export const getUserProfile = (userId) => request.get(USER_NESTED_ENDPOINTS.PROFILE(userId));

export const getUserSessions = (userId) => request.get(USER_NESTED_ENDPOINTS.SESSIONS(userId));

export const getUserMFADevices = (userId) =>
  request.get(USER_NESTED_ENDPOINTS.MFA_DEVICES(userId));

export const getUserPreferences = (userId) =>
  request.get(USER_NESTED_ENDPOINTS.PREFERENCES(userId));