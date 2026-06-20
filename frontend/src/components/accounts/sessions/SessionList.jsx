import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiAlertCircle, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { useAuth } from '../../../hooks/accounts/useAuth';
import SessionCard from './components/SessionCard';
import SessionDetails from './components/SessionDetails';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import EmptyState from '../../common/Feedback/EmptyState';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const SessionList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const {
        sessions,
        activeSessions,
        isLoading,
        fetchSessions,
        fetchActiveSessions,
        terminateSession,
        terminateAllSessions,
    } = useSessions();

    const [selectedSession, setSelectedSession] = useState(null);
    const [terminateAllConfirm, setTerminateAllConfirm] = useState(false);
    const [terminateSingleConfirm, setTerminateSingleConfirm] = useState(null);

    // Load sessions on mount
    useEffect(() => {
        fetchSessions();
        fetchActiveSessions();
        
        // Refresh sessions every 30 seconds
        const interval = setInterval(() => {
            fetchSessions();
            fetchActiveSessions();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [fetchSessions, fetchActiveSessions]);

    const handleTerminate = async (sessionId) => {
        try {
            await terminateSession(sessionId);
            dispatch(showAlert({ type: 'success', message: 'Session terminated successfully' }));
            fetchSessions();
            fetchActiveSessions();
            setTerminateSingleConfirm(null);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to terminate session' }));
        }
    };

    const handleTerminateAll = async () => {
        try {
            await terminateAllSessions();
            dispatch(showAlert({ type: 'success', message: 'All other sessions terminated' }));
            fetchSessions();
            fetchActiveSessions();
            setTerminateAllConfirm(false);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to terminate sessions' }));
        }
    };

    const handleRefresh = () => {
        fetchSessions();
        fetchActiveSessions();
        dispatch(showAlert({ type: 'info', message: 'Refreshing sessions...' }));
    };

    const getCurrentSession = () => {
        return sessions?.find(s => s.is_current);
    };

    const otherSessions = sessions?.filter(s => !s.is_current) || [];
    const currentSession = getCurrentSession();

    if (isLoading && !sessions?.length) {
        return (
            <div className="sessions-page">
                <div className="page-header">
                    <h1>Active Sessions</h1>
                    <p>Loading your active sessions...</p>
                </div>
                <SkeletonLoader type="list" count={3} />
            </div>
        );
    }

    return (
        <div className="sessions-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Active Sessions</h1>
                    <p>Manage your active login sessions across all devices</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={handleRefresh} title="Refresh">
                        <FiRefreshCw size={18} />
                    </button>
                    {otherSessions.length > 0 && (
                        <button 
                            className="btn btn-danger" 
                            onClick={() => setTerminateAllConfirm(true)}
                        >
                            <FiLogOut size={16} />
                            Terminate All
                        </button>
                    )}
                </div>
            </div>

            {/* Security Tip */}
            <div className="security-tip">
                <FiAlertCircle size={16} />
                <span>
                    If you don't recognize a session, terminate it immediately and 
                    <button 
                        className="link-btn" 
                        onClick={() => navigate('/security/change-password')}
                    >
                        change your password
                    </button>.
                </span>
            </div>

            {/* Current Session Card */}
            {currentSession && (
                <div className="current-session-section">
                    <h2>Current Session</h2>
                    <SessionCard 
                        session={currentSession}
                        onTerminate={() => {}}  // Cannot terminate current session
                        onViewDetails={() => setSelectedSession(currentSession)}
                        isCurrent={true}
                    />
                </div>
            )}

            {/* Other Sessions */}
            {otherSessions.length > 0 && (
                <div className="other-sessions-section">
                    <div className="section-header">
                        <h2>Other Active Sessions</h2>
                        <span className="session-count">
                            {otherSessions.length} session{otherSessions.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="sessions-grid">
                        {otherSessions.map(session => (
                            <SessionCard 
                                key={session.id}
                                session={session}
                                onTerminate={() => setTerminateSingleConfirm(session)}
                                onViewDetails={() => setSelectedSession(session)}
                                isCurrent={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!currentSession && otherSessions.length === 0) && (
                <EmptyState 
                    title="No Active Sessions"
                    description="You are not currently logged in on any device"
                    icon={<FiLogOut size={48} />}
                />
            )}

            {/* Session Details Modal */}
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

            {/* Terminate Single Session Confirmation */}
            <ConfirmationDialog
                isOpen={!!terminateSingleConfirm}
                onClose={() => setTerminateSingleConfirm(null)}
                onConfirm={() => handleTerminate(terminateSingleConfirm.id)}
                type="warning"
                title="Terminate Session"
                message={`Are you sure you want to terminate this session from ${terminateSingleConfirm?.browser || 'Unknown'} ${terminateSingleConfirm?.os || 'Device'}?`}
                confirmText="Terminate"
            />

            {/* Terminate All Sessions Confirmation */}
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