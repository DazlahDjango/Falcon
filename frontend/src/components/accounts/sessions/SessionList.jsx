import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import SessionCard from './components/SessionCard';
import SessionDetails from './components/SessionDetails';
import { fetchSessions, terminateSession, terminateAllSessions } from '../../../store/accounts/slice/sessionSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import EmptyState from '../../common/Feedback/EmptyState';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const SessionList = () => {
    const dispatch = useDispatch();
    const { sessions, isLoading } = useSelector((state) => state.sessions);
    const { user } = useSelector((state) => state.auth);
    const [selectedSession, setSelectedSession] = useState(null);
    const [terminateAllConfirm, setTerminateAllConfirm] =useState(false);
    useEffect(() => {
        dispatch(fetchSessions());
        const interval = setInterval(() => {
            dispatch(fetchSessions());
        }, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);
    const handleTerminate = async (sessionId) => {
        try {
            await dispatch(terminateSession(sessionId)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Session terminated'}));
            dispatch(fetchSessions());
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to terminate session' }));
        }
    };
    const handleTerminateAll = async () => {
        try {
            await dispatch(terminateAllSessions()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'All other sessions terminated' }));
            dispatch(fetchSessions());
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to terminate sessions' }));
        }
        setTerminateAllConfirm(false);
    };
    const currentSessionId = sessions.find(s => s.is_current)?.id;
    if (isLoading && !sessions.length) {
        return (
            <div className="sessions-page">
                <SkeletonLoader type='list' count={3} />
            </div>
        );
    }
    return (
        <div className="sessions-page">
            <div className="page-header">
                <div>
                    <h1>Active Sessions</h1>
                    <p>Manage your active login sessions</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => dispatch(fetchSessions())}>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                    {sessions.filter(s => !s.is_current).length > 0 && (
                        <button className="btn btn-danger" onClick={() => setTerminateAllConfirm(true)}>
                            Terminate All
                        </button>
                    )}
                </div>
            </div>
            
            <div className="security-tip">
                <FiAlertCircle size={16} />
                <span>If you don't recognize a session, terminate it immediately and change your password.</span>
            </div>
            
            {sessions.length === 0 ? (
                <EmptyState 
                    title="No active sessions"
                    description="You are not logged in on any device"
                />
            ) : (
                <div className="sessions-grid">
                    {sessions.map(session => (
                        <SessionCard 
                            key={session.id}
                            session={session}
                            onTerminate={() => handleTerminate(session.id)}
                            onViewDetails={() => setSelectedSession(session)}
                            isCurrent={session.id === currentSessionId}
                        />
                    ))}
                </div>
            )}
            
            <SessionDetails 
                session={selectedSession}
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                onTerminate={() => {
                    if (selectedSession) {
                        handleTerminate(selectedSession.id);
                        setSelectedSession(null);
                    }
                }}
            />
            
            <ConfirmationDialog
                isOpen={terminateAllConfirm}
                onClose={() => setTerminateAllConfirm(false)}
                onConfirm={handleTerminateAll}
                type="warning"
                title="Terminate All Sessions"
                message="This will log you out from all other devices. Your current session will remain active."
                confirmText="Terminate All"
            />
        </div>
    );
};
export default SessionList;