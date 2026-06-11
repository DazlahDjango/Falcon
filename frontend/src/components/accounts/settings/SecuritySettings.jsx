import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FiShield, FiSmartphone, FiCode, FiLock, 
    FiLogOut, FiClock, FiChevronRight, FiAlertCircle 
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import SessionSection from './components/SessionSection';

const SecuritySettings = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        isMfaEnabled,
        devices,
        backupCodesRemaining,
        loadMfaStatus,
        loadDevices,
        statusLoading,
    } = useMFA();
    const { activeSessions, fetchActiveSessions } = useSessions();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([
                loadMfaStatus(),
                loadDevices(),
                fetchActiveSessions()
            ]);
            setIsLoading(false);
        };
        loadData();
    }, [loadMfaStatus, loadDevices, fetchActiveSessions]);

    const getLastLoginInfo = () => {
        return {
            lastLogin: user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
            lastIp: user?.last_login_ip || 'Unknown',
            joinedDate: user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'
        };
    };

    const lastLogin = getLastLoginInfo();

    if (isLoading) {
        return (
            <div className="security-settings-loading">
                <Spinner size="md" />
                <p>Loading security settings...</p>
            </div>
        );
    }

    return (
        <div className="security-settings">
            <div className="settings-header">
                <h2>Security</h2>
                <p>Manage your account security settings</p>
            </div>
            
            <div className="security-sections">
                {/* Password Change Card */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiLock size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Password</h3>
                        <p>Change your password to keep your account secure</p>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/profile')}
                        >
                            Change Password
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>
                
                {/* MFA Section Card */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiSmartphone size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Two-Factor Authentication</h3>
                        <p>Add an extra layer of security to your account</p>
                        <div className="mfa-status-row">
                            <span className={`mfa-badge ${isMfaEnabled ? 'enabled' : 'disabled'}`}>
                                {isMfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}
                            </span>
                            {isMfaEnabled && devices && (
                                <span className="device-count">
                                    {devices.filter(d => d.is_active).length} active device(s)
                                </span>
                            )}
                            {isMfaEnabled && backupCodesRemaining > 0 && (
                                <span className="backup-count">
                                    {backupCodesRemaining} backup codes left
                                </span>
                            )}
                        </div>
                        <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/security/mfa')}
                        >
                            {isMfaEnabled ? 'Manage MFA Settings' : 'Enable MFA'}
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>
                
                {/* Active Sessions Card */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiLogOut size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Active Sessions</h3>
                        <p>Manage your active login sessions across devices</p>
                        <div className="session-stats">
                            <span className="session-count">
                                {activeSessions?.length || 0} active session(s)
                            </span>
                        </div>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/sessions')}
                        >
                            View All Sessions
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Recent Login Activity Card */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiClock size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Recent Login Activity</h3>
                        <div className="login-info">
                            <div className="login-item">
                                <span className="login-label">Last Login:</span>
                                <span className="login-value">{lastLogin.lastLogin}</span>
                            </div>
                            <div className="login-item">
                                <span className="login-label">Last IP:</span>
                                <span className="login-value">{lastLogin.lastIp}</span>
                            </div>
                            <div className="login-item">
                                <span className="login-label">Account Created:</span>
                                <span className="login-value">{lastLogin.joinedDate}</span>
                            </div>
                        </div>
                        <button 
                            className="btn-link"
                            onClick={() => navigate('/security/activity')}
                        >
                            View Full Activity Log
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Session Section (for terminating sessions) */}
            <SessionSection />
        </div>
    );
};

export default SecuritySettings;