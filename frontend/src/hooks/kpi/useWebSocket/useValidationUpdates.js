import { useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';

const useValidationUpdates = (userId) => {
    const [pendingCount, setPendingCount] = useState(0);
    const [latestValidation, setLatestValidation] = useState(null);
    const endpoint = `/ws/kpi/validation/${userId}/`;
    const handleValidationUpdate = useCallback((data) => {
        if (data.type === 'validation_update') {
            setLatestValidation(data.data);
            if (data.data.pending_count !== undefined) {
                setPendingCount(data.data.pending_count);
            }
        }
    }, []);
    const { isConnected, sendMessage } = useWebSocket(endpoint, handleValidationUpdate, {
        autoConnect: !!userId
    });
    const refreshValidations = useCallback(() => {
        sendMessage({ type: 'refresh' });
    }, [sendMessage]);
    return {
        pendingCount,
        latestValidation,
        isConnected,
        refreshValidations
    };
};
export default useValidationUpdates;