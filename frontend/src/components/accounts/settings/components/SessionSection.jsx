import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { useSessions } from '../../../../hooks/accounts/useSessions';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import ConfirmationDialog from '../../../common/Feedback/ConfirmationDialog';
import Spinner from '../../../common/UI/Spinner';

const SessionSection = () => {
    const dispatch = useDispatch();
    const { activeSessions, isLoading, fetchActiveSessions, terminateAllSessions } = useSessions();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);

    useEffect(() => {
        fetchActiveSessions();
    }, [fetchActiveSessions]);

    const handleTerminateAll = async () => {
        setIsTerminating(true);
        try {
            await terminateAllSessions();
            await fetchActiveSessions();
            dispatch(showAlert({ type: 'success', message: 'All other sessions terminated' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to terminate sessions' }));
        } finally {
            setIsTerminating(false);
            setShowConfirm(false);
        }
    };

    const otherSessions = activeSessions?.filter(s => !s.is_current) || [];

    if (isLoading) {
        return (
            <div className="session-section-loading">
                <Spinner size="sm" />
            </div>
        );
    }

    if (otherSessions.length === 0) {
        return null;
    }

    return (
        <div className="session-section">
            <div className="section-header">
                <h3>Active Sessions on Other Devices</h3>
                <span className="session-count">
                    {otherSessions.length} active session{otherSessions.length !== 1 ? 's' : ''} on other devices
                </span>
            </div>

            <div className="other-sessions-list">
                {otherSessions.slice(0, 3).map(session => (
                    <div key={session.id} className="session-item">
                        <div className="session-device-info">
                            <strong>{session.browser || 'Unknown Browser'}</strong>
                            <span>{session.os || 'Unknown OS'}</span>
                            <span className="session-ip">{session.ip_address}</span>
                        </div>
                        <div className="session-last-active">
                            Last active: {new Date(session.last_activity).toLocaleString()}
                        </div>
                    </div>
                ))}
                {otherSessions.length > 3 && (
                    <div className="more-sessions">
                        +{otherSessions.length - 3} more session(s)
                    </div>
                )}
            </div>

            <div className="session-actions">
                <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => setShowConfirm(true)}
                    disabled={isTerminating}
                >
                    {isTerminating ? <Spinner size="sm" /> : <FiLogOut size={14} />}
                    Terminate All Other Sessions
                </button>
            </div>

            <ConfirmationDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleTerminateAll}
                type="warning"
                title="Terminate All Sessions"
                message="This will log you out from all other devices. Your current session will remain active."
                confirmText="Terminate All"
            />
        </div>
    );
};

export default SessionSection;