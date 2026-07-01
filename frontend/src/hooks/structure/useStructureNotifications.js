import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
    addStructNotification,
    clearStructNotifications,
    markStructNotificationRead,
    markAllStructNotificationsRead,
    setStructNotifications,
    removeStructNotification,
    resetStructNotifications,
} from '../../store/structure/slice/notificationSlice';

export const useStructureNotifications = () => {
    const dispatch = useDispatch();

    const notifications = useSelector((state) => state.structNotifications?.items || []);
    const unreadCount = useSelector((state) => state.structNotifications?.unreadCount || 0);
    const isLoading = useSelector((state) => state.structNotifications?.isLoading || false);
    const error = useSelector((state) => state.structNotifications?.error || null);

    const add = useCallback((notification) => {
        dispatch(addStructNotification(notification));
    }, [dispatch]);

    const clear = useCallback(() => {
        dispatch(clearStructNotifications());
    }, [dispatch]);

    const markRead = useCallback((id) => {
        dispatch(markStructNotificationRead(id));
    }, [dispatch]);

    const markAllRead = useCallback(() => {
        dispatch(markAllStructNotificationsRead());
    }, [dispatch]);

    const set = useCallback((items) => {
        dispatch(setStructNotifications(items));
    }, [dispatch]);

    const remove = useCallback((id) => {
        dispatch(removeStructNotification(id));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetStructNotifications());
    }, [dispatch]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        add,
        clear,
        markRead,
        markAllRead,
        set,
        remove,
        reset,
    };
};

export default useStructureNotifications;