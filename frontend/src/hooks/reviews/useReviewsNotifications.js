// src/hooks/reviews/useReviewsNotifications.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectSelectedNotification,
  selectUnreadNotificationCount,
  selectUnreadNotifications,
  selectReadNotifications,
} from '../../store/reviews/selectors';
import {
  fetchNotifications,
  fetchNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  fetchUnreadCount,
  resetNotificationState,
} from '../../store/reviews/slices/notification.slice';
import { useReviewsPermissions } from './';

const useReviewsNotifications = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const selected = useSelector(selectSelectedNotification);
  const unreadCount = useSelector(selectUnreadNotificationCount);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const readNotifications = useSelector(selectReadNotifications);

  // Actions
  const fetchAll = useCallback(
    (params) => {
      if (!permissions.canManageNotifications) {
        throw new Error('You do not have permission to view notifications');
      }
      return dispatch(fetchNotifications(params));
    },
    [dispatch, permissions.canManageNotifications]
  );

  const fetchOne = useCallback(
    (id) => {
      if (!permissions.canManageNotifications) {
        throw new Error('You do not have permission to view notifications');
      }
      return dispatch(fetchNotification(id));
    },
    [dispatch, permissions.canManageNotifications]
  );

  const markAsRead = useCallback(
    (id) => {
      if (!permissions.canManageNotifications) {
        throw new Error('You do not have permission to manage notifications');
      }
      return dispatch(markNotificationAsRead(id));
    },
    [dispatch, permissions.canManageNotifications]
  );

  const markAllAsRead = useCallback(
    () => {
      if (!permissions.canManageNotifications) {
        throw new Error('You do not have permission to manage notifications');
      }
      return dispatch(markAllNotificationsAsRead());
    },
    [dispatch, permissions.canManageNotifications]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canManageNotifications) {
        throw new Error('You do not have permission to delete notifications');
      }
      return dispatch(deleteNotification(id));
    },
    [dispatch, permissions.canManageNotifications]
  );

  const getUnreadCount = useCallback(
    () => {
      if (!permissions.canManageNotifications) {
        throw new Error('You do not have permission to view notifications');
      }
      return dispatch(fetchUnreadCount());
    },
    [dispatch, permissions.canManageNotifications]
  );

  const reset = useCallback(
    () => dispatch(resetNotificationState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageNotifications,
    [permissions.canManageNotifications]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    unreadCount,
    unreadNotifications,
    readNotifications,

    // Actions
    fetchAll,
    fetchOne,
    markAsRead,
    markAllAsRead,
    remove,
    getUnreadCount,
    reset,

    // Permissions
    canManage,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    hasUnread: unreadCount > 0,
    getById: (id) => data.find((item) => item.id === id),
  };
};

export default useReviewsNotifications;