import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiCheck, FiX, FiShield, FiSmartphone } from 'react-icons/fi';
import { disableMfa } from '../../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import ConfirmationDialog from '../../../common/Feedback/ConfirmationDialog';

const MFASection = ({ user }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
    cosnt [showDisableConfirm, setShowDisableConfirm] = useState(false);
    useEffect(() => {
        setMfaEnabled(user?.mfa_enabled || false);
    }, [user]);
    const handleEnable = () => {
        navigate('/mfa-setup');
    };
    const handleDisable = async () => {
        try {
            await dispatch(disableMfa()).unwrap();
            setMfaEnabled(false)
            dispatch(showAlert({ type: 'success', message: 'MFA disabled' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to disable MFA'}));
        }
        setShowDisableConfirm(false);
    };
    return (
        <div className="mfa-section">
            <div className="mfa-status">
                <div className={`status-indicator ${mfaEnabled ? 'enabled' : 'disabled'}`}>
                    {mfaEnabled ? <FiCheck size={16} /> : <FiX size={16} />}
                </div>
                <div className="status-text">
                    <strong>{mfaEnabled ? 'Enabled' : 'Disabled'}</strong>
                    <p>{mfaEnabled 
                        ? 'Your account is protected with two-factor authentication' 
                        : 'Two-factor authentication adds an extra layer of security'}</p>
                </div>
            </div>
            
            <div className="mfa-actions">
                {!mfaEnabled ? (
                    <button className="btn btn-primary" onClick={handleEnable}>
                        <FiShield size={16} />
                        Enable MFA
                    </button>
                ) : (
                    <button className="btn btn-danger" onClick={() => setShowDisableConfirm(true)}>
                        <FiX size={16} />
                        Disable MFA
                    </button>
                )}
            </div>
            
            <ConfirmationDialog
                isOpen={showDisableConfirm}
                onClose={() => setShowDisableConfirm(false)}
                onConfirm={handleDisable}
                type="warning"
                title="Disable Two-Factor Authentication"
                message="Are you sure you want to disable MFA? This will make your account less secure."
                confirmText="Disable MFA"
            />
        </div>
    );
};
export default MFASection;