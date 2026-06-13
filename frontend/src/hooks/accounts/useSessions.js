import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSessions,
    fetchActiveSessions,
    terminateSession,
    terminateAllSessions,
    clearError,
    setCurrentSession,
} from '../../store/accounts/slice/sessionSlice';

export const useSessions = () => {
    const dispatch = useDispatch();
    const sessionState = useSelector((state) => state.sessions) || {
        sessions: [],
        activeSessions: [],
        currentSession: null,
        pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            page_size: 20
        },
        isLoading: false,
        error: null
    };

    const loadSessions = useCallback(async (params = {}) => {
        return await dispatch(fetchSessions(params)).unwrap();
    }, [dispatch]);

    const loadActiveSessions = useCallback(async () => {
        return await dispatch(fetchActiveSessions()).unwrap();
    }, [dispatch]);

    const terminateUserSession = useCallback(async (sessionId) => {
        return await dispatch(terminateSession(sessionId)).unwrap();
    }, [dispatch]);

    const terminateAllUserSessions = useCallback(async () => {
        return await dispatch(terminateAllSessions()).unwrap();
    }, [dispatch]);

    const clearSessionsError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const updateCurrentSession = useCallback((session) => {
        dispatch(setCurrentSession(session));
    }, [dispatch]);

    return {
        // State
        sessions: sessionState.sessions,
        activeSessions: sessionState.activeSessions,
        currentSession: sessionState.currentSession,
        pagination: sessionState.pagination,
        isLoading: sessionState.isLoading,
        error: sessionState.error,

        // Actions
        loadSessions,
        loadActiveSessions,
        terminateSession: terminateUserSession,
        terminateAllSessions: terminateAllUserSessions,
        clearError: clearSessionsError,
        setCurrentSession: updateCurrentSession,
    };
};

export default useSessions;