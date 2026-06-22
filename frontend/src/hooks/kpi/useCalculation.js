/**
 * Hook for triggering calculations
 */
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    triggerCalculation,
    getCalculationStatus,
    selectActiveTask,
    selectTaskStatus,
    selectTriggering
} from '../../store/kpi';

const useCalculation = () => {
    const dispatch = useDispatch();
    const [polling, setPolling] = useState(false);
    const [pollInterval, setPollInterval] = useState(null);
    
    const activeTask = useSelector(selectActiveTask);
    const taskStatus = useSelector(selectTaskStatus);
    const triggering = useSelector(selectTriggering);
    
    const trigger = useCallback(async (year, month, force = false, userIds = null) => {
        return dispatch(triggerCalculation({ year, month, force, userIds })).unwrap();
    }, [dispatch]);
    
    const checkStatus = useCallback(async (taskId) => {
        return dispatch(getCalculationStatus(taskId)).unwrap();
    }, [dispatch]);
    
    const pollStatus = useCallback((taskId, onComplete, interval = 3000) => {
        if (pollInterval) clearInterval(pollInterval);
        
        setPolling(true);
        const intervalId = setInterval(async () => {
            try {
                const status = await checkStatus(taskId);
                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(intervalId);
                    setPolling(false);
                    if (onComplete) onComplete(status);
                }
            } catch (error) {
                clearInterval(intervalId);
                setPolling(false);
            }
        }, interval);
        
        setPollInterval(intervalId);
    }, [checkStatus, pollInterval]);
    
    const stopPolling = useCallback(() => {
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
            setPolling(false);
        }
    }, [pollInterval]);
    
    return {
        trigger,
        checkStatus,
        pollStatus,
        stopPolling,
        activeTask,
        taskStatus,
        triggering,
        polling,
        isCalculating: triggering || polling,
    };
};

export default useCalculation;