import { useCallback } from 'react';
import useWebSocket from './useWebSocket';
import useToast from '../useToast';

const useKPINotifications = (userId) => {
    const toast = useToast();
    const endpoint = `/ws/kpi/notifications/${userId}/`;
    const handleNotification = useCallback((data) => {
        const { type, title, message } = data;
        switch (type) {
            case 'red_alert':
                toast.warning(message || title, { duration: 10000 });
                break;
            case 'approval':
                toast.success(message || title);
                break;
            case 'rejection':
                toast.error(message || title);
                break;
            case 'escalation':
                toast.info(message || title);
                break;
            default:
                toast.info(message || title);
        }
    }, [toast]);
    const { isConnected, sendMessage } = useWebSocket(endpoint, handleNotification, {
        autoConnect: !!userId
    });
    return {
        isConnected,
        sendNotification: sendMessage
    };
};
export default useKPINotifications;