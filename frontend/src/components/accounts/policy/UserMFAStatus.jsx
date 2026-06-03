import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiArrowLeft,
    FiSmartphone,
    FiCode,
    FiCalendar,
    FiClock,
    FiShield,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiTrash2,
    FiMail,
    FiUser,
    FiBriefcase
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { ROLE_DISPLAY_NAMES } from '../../../config/constants';
import './policy.css';

const UserMFAStatus = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        userMFAStatus,
        userMFAStatusLoading,
        adminMFAStatus,
        adminMFAStatusLoading,
        resettingUserMFA,
        clearingDevices,
        loadUserMFAStatus,
        loadAdminMFAStatus,
        resetUserMFA,
        clearUserDevices,
    } = useAdminMFA();

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeviceConfirm, setShowDeviceConfirm] = useState(null);
    const [resetReason, setResetReason] = useState('');

    useEffect(() => {
        if (userId) {
            loadUserMFAStatus(userId);
            loadAdminMFAStatus(userId);
        }
    }, [userId, loadUserMFAStatus, loadAdminMFAStatus]);

    const handleResetMFA = async () => {
        try {
            await resetUserMFA(userId, resetReason);
            setShowResetConfirm(false);
            setResetReason('');
            await loadUserMFAStatus(userId);
            await loadAdminMFAStatus(userId);
            dispatch(showAlert({ type: 'success', message: 'MFA reset successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset MFA' }));
        }
    };

    const handleClearDevice = async (deviceId, deviceName) => {
        try {
            await clearUserDevices(userId, deviceId);
            setShowDeviceConfirm(null);
            await loadUserMFAStatus(userId);
            await loadAdminMFAStatus(userId);
            dispatch(showAlert({ type: 'success', message: `${deviceName} removed successfully` }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to remove device' }));
        }
    };

    const getStatusBadge = (requiresEnrollment) => {
        if (requiresEnrollment) {
            return <span className="status-badge warning"><FiAlertCircle /> MFA Required - Not Enrolled</span>;
        }
        return <span className="status-badge success"><FiCheckCircle /> MFA Compliant</span>;
    };

    if (userMFAStatusLoading || adminMFAStatusLoading) {
        return (
            <div className="policy-loading">
                <Spinner size="lg" />
                <p>Loading user MFA status...</p>
            </div>
        );
    }

    const user = userMFAStatus?.user || {};
    const mfa = userMFAStatus?.mfa || {};
    const policy = userMFAStatus?.policy || {};
    const adminMfa = adminMFAStatus || {};

    return (
        <div className="policy-container user-mfa-status">
            {/* Header */}
            <div className="status-header">
                <button className="back-btn" onClick={() => navigate('/security/mfa/users')}>
                    <FiArrowLeft /> Back to Users
                </button>
            </div>

            {/* User Profile Card */}
            <div className="user-profile-card">
                <div className="profile-avatar">
                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>{user.full_name || user.email}</h2>
                    <div className="profile-details">
                        <span><FiMail /> {user.email}</span>
                        <span><FiBriefcase /> {ROLE_DISPLAY_NAMES[user.role] || user.role}</span>
                        <span><FiUser /> ID: {userId}</span>
                    </div>
                </div>
                <div className="profile-status">
                    {getStatusBadge(policy.requires_enrollment)}
                </div>
            </div>

            {/* Policy Summary */}
            <div className="policy-summary-card">
                <h3><FiShield /> MFA Policy</h3>
                <div className="policy-details">
                    <div className="policy-item">
                        <span className="policy-label">User Override:</span>
                        <span className="policy-value">
                            {policy.user_override === true && 'Force MFA On'}
                            {policy.user_override === false && 'Force MFA Off'}
                            {policy.user_override === null && 'None (Follows Role Policy)'}
                        </span>
                    </div>
                    <div className="policy-item">
                        <span className="policy-label">Required by Role:</span>
                        <span className="policy-value">{policy.required_by_role ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="policy-item">
                        <span className="policy-label">Effectively Required:</span>
                        <span className="policy-value">{policy.effectively_required ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="policy-item">
                        <span className="policy-label">Requires Enrollment:</span>
                        <span className="policy-value">{policy.requires_enrollment ? 'Yes - User needs to set up MFA' : 'No'}</span>
                    </div>
                </div>
            </div>

            {/* MFA Devices */}
            <div className="devices-section">
                <div className="section-header">
                    <h3><FiSmartphone /> MFA Devices</h3>
                    <span className="device-count">{mfa.devices_count} device(s)</span>
                </div>

                {mfa.devices && mfa.devices.length > 0 ? (
                    <div className="devices-list">
                        {mfa.devices.map((device) => (
                            <div key={device.id} className="device-card">
                                <div className="device-icon">
                                    <FiSmartphone />
                                </div>
                                <div className="device-info">
                                    <div className="device-name">{device.name}</div>
                                    <div className="device-meta">
                                        <span className="device-type">{device.device_type?.toUpperCase()}</span>
                                        {device.is_primary && <span className="device-primary">Primary</span>}
                                        {device.is_verified && <span className="device-verified">Verified</span>}
                                    </div>
                                    {device.last_used_at && (
                                        <div className="device-last-used">
                                            Last used: {new Date(device.last_used_at).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="device-actions">
                                    <button
                                        className="btn-icon danger"
                                        onClick={() => setShowDeviceConfirm(device)}
                                        title="Remove device"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-devices">
                        <FiSmartphone className="empty-icon" />
                        <p>No MFA devices found</p>
                    </div>
                )}
            </div>

            {/* Backup Codes */}
            <div className="backup-section">
                <div className="section-header">
                    <h3><FiCode /> Backup Codes</h3>
                </div>
                <div className="backup-stats">
                    <div className="stat-item">
                        <span className="stat-value">{mfa.backup_codes_remaining || 0}</span>
                        <span className="stat-label">Remaining</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{(adminMfa.mfa?.backup_codes?.total || 0) - (mfa.backup_codes_remaining || 0)}</span>
                        <span className="stat-label">Used</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{adminMfa.mfa?.backup_codes?.total || 0}</span>
                        <span className="stat-label">Total Generated</span>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="admin-actions-section">
                <h3>Administrative Actions</h3>
                <div className="admin-actions">
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowResetConfirm(true)}
                        disabled={resettingUserMFA}
                    >
                        {resettingUserMFA ? <Spinner size="sm" /> : <FiRefreshCw />}
                        Reset All MFA
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleClearDevice(userId)}
                        disabled={clearingDevices || mfa.devices_count === 0}
                    >
                        {clearingDevices ? <Spinner size="sm" /> : <FiTrash2 />}
                        Clear All Devices
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Reset MFA for User?</h3>
                        </div>
                        <p>This will:</p>
                        <ul>
                            <li>Remove all MFA devices</li>
                            <li>Invalidate all backup codes</li>
                            <li>Disable MFA for this user</li>
                            <li>Send notification to the user</li>
                        </ul>
                        <div className="form-group">
                            <label>Reason (optional)</label>
                            <textarea
                                value={resetReason}
                                onChange={(e) => setResetReason(e.target.value)}
                                placeholder="Enter reason for MFA reset..."
                                rows="3"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleResetMFA}>
                                Yes, Reset MFA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Device Remove Confirmation Modal */}
            {showDeviceConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Remove Device?</h3>
                        </div>
                        <p>Are you sure you want to remove "{showDeviceConfirm.name}"? The user will need to re-add this device.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowDeviceConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={() => handleClearDevice(showDeviceConfirm.id, showDeviceConfirm.name)}>
                                Remove Device
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMFAStatus;