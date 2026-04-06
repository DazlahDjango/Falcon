import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiRefreshCw } from 'react-icons/fi';
import { fetchSessions, terminateAllSessions } from '../../../../store/accounts/slice/sessionSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import ConfirmationDialog from '../../../common/Feedback/ConfirmationDialog';

const SessionSection = () => {
    const dispatch = useDispatch();
    const { sessions } = useSelector((state) => state.sessions);
    const [showConfirm, setShowConfirm] = useState(false);
    useEffect(() => {
        dispatch(fetchSessions());
    }, [dispatch]);
    const handleTerminateAll = async () => {
        try {
            await dispatch(terminateAllSessions()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'All other sessions terminated' }));
            dispatch(fetchSessions());
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to terminate session' }));
        }
        setShowConfirm(false);
    };
    const otherSessions = sessions?.filter(s => !s.is_current) || [];
    return (
        <div className="session-section">
            <div className="session-stats">
                <span className="session-count">
                    {otherSessions.length} active session{otherSessions.length !== 1 ? 's' : ''} on other devices
                </span>
                {otherSessions.length > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>
                        <FiLogOut size={14} />
                        Terminate All
                    </button>
                )}
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