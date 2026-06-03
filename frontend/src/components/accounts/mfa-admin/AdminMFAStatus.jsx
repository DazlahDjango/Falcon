import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiArrowLeft,
    FiSmartphone,
    FiCode,
    FiShield,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiTrash2,
    FiMail,
    FiUser,
    FiBriefcase,
    FiClock,
    FiCalendar,
    FiShieldOff,
    FiLock,
    FiUnlock
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { ROLE_DISPLAY_NAMES } from '../../../config/constants';
import './mfa-admin.css';

const AdminMFAStatus = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        adminMFAStatus,
        adminMFAStatusLoading,
        resettingUserMFA,
        clearingDevices,
        loadAdminMFAStatus,
        resetUserMFA,
        clearUserDevices,
    } = useAdminMFA();

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeviceConfirm, setShowDeviceConfirm] = useState(null);
    const [resetReason, setResetReason] = useState('');
    const [showAllDevicesConfirm, setShowAllDevicesConfirm] = useState(false);

    useEffect(() => {
        if (userId) {
            loadAdminMFAStatus(userId);
        }
    }, [userId, loadAdminMFAStatus]);

    const handleResetMFA = async () => {
        try {
            await resetUserMFA(userId, resetReason);
            setShowResetConfirm(false);
            setResetReason('');
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
            await loadAdminMFAStatus(userId);
            dispatch(showAlert({ type: 'success', message: `${deviceName} removed successfully` }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to remove device' }));
        }
    };

    const handleClearAllDevices = async () => {
        try {
            await clearUserDevices(userId);
            setShowAllDevicesConfirm(false);
            await loadAdminMFAStatus(userId);
            dispatch(showAlert({ type: 'success', message: 'All MFA devices cleared' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to clear devices' }));
        }
    };

    const getStatusBadge = () => {
        if (adminMFAStatus?.mfa?.enabled) {
            return <span className="status-badge success"><FiCheckCircle /> MFA Enabled</span>;
        }
        if (adminMFAStatus?.policy?.effectively_required) {
            return <span className="status-badge warning"><FiAlertCircle /> MFA Required - Not Enrolled</span>;
        }
        return <span className="status-badge muted"><FiShieldOff /> MFA Disabled</span>;
    };

    const getDeviceStatusIcon = (device) => {
        if (device.is_verified && device.is_active) {
            return <FiCheckCircle className="device-status-icon success" />;
        }
        if (device.is_locked) {
            return <FiLock className="device-status-icon warning" />;
        }
        return <FiShield className="device-status-icon muted" />;
    };

    if (adminMFAStatusLoading) {
        return (
            <div className="mfa-admin-loading">
                <Spinner size="lg" />
                <p>Loading MFA status...</p>
            </div>
        );
    }

    const user = adminMFAStatus?.user || {};
    const mfa = adminMFAStatus?.mfa || {};
    const policy = adminMFAStatus?.policy || {};

    return (
        <div className="mfa-admin-container">
            {/* Header */}
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin/mfa/users')}>
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
                    {getStatusBadge()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FiSmartphone /></div>
                    <div className="stat-info">
                        <div className="stat-value">{mfa.devices?.length || 0}</div>
                        <div className="stat-label">Active Devices</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiCode /></div>
                    <div className="stat-info">
                        <div className="stat-value">{mfa.backup_codes?.remaining || 0}</div>
                        <div className="stat-label">Backup Codes Left</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiCalendar /></div>
                    <div className="stat-info">
                        <div className="stat-value">
                            {mfa.verified_at ? new Date(mfa.verified_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="stat-label">Last Verified</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiShield /></div>
                    <div className="stat-info">
                        <div className="stat-value">{policy.effectively_required ? 'Yes' : 'No'}</div>
                        <div className="stat-label">MFA Required</div>
                    </div>
                </div>
            </div>

            {/* Policy Summary */}
            <div className="policy-summary-card">
                <h3><FiShield /> MFA Policy Details</h3>
                <div className="policy-grid">
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

            {/* MFA Devices Section */}
            <div className="devices-section">
                <div className="section-header">
                    <h3><FiSmartphone /> MFA Devices</h3>
                    {mfa.devices && mfa.devices.length > 0 && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowAllDevicesConfirm(true)}
                            disabled={clearingDevices}
                        >
                            {clearingDevices ? <Spinner size="sm" /> : <FiTrash2 />}
                            Clear All
                        </button>
                    )}
                </div>

                {mfa.devices && mfa.devices.length > 0 ? (
                    <div className="devices-list">
                        {mfa.devices.map((device) => (
                            <div key={device.id} className="device-card">
                                <div className="device-icon">
                                    <FiSmartphone />
                                </div>
                                <div className="device-info">
                                    <div className="device-name">
                                        {device.name}
                                        {device.is_primary && <span className="primary-badge">Primary</span>}
                                    </div>
                                    <div className="device-meta">
                                        <span className="device-type">{device.device_type?.toUpperCase()}</span>
                                        <span className="device-status-icon">
                                            {getDeviceStatusIcon(device)}
                                            {device.is_verified ? 'Verified' : device.is_locked ? 'Locked' : 'Pending'}
                                        </span>
                                    </div>
                                    {device.last_used_at && (
                                        <div className="device-last-used">
                                            <FiClock /> Last used: {new Date(device.last_used_at).toLocaleString()}
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

            {/* Backup Codes Section */}
            <div className="backup-section">
                <div className="section-header">
                    <h3><FiCode /> Backup Codes</h3>
                </div>
                <div className="backup-stats">
                    <div className="stat-item">
                        <span className="stat-value">{mfa.backup_codes?.remaining || 0}</span>
                        <span className="stat-label">Remaining</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{mfa.backup_codes?.used || 0}</span>
                        <span className="stat-label">Used</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{mfa.backup_codes?.total || 0}</span>
                        <span className="stat-label">Total Generated</span>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="admin-actions-section">
                <h3>Administrative Actions</h3>
                <div className="admin-actions-grid">
                    <button
                        className="action-card"
                        onClick={() => setShowResetConfirm(true)}
                        disabled={resettingUserMFA}
                    >
                        <FiRefreshCw className="action-icon" />
                        <div className="action-info">
                            <strong>Reset All MFA</strong>
                            <p>Clear all devices, backup codes, and disable MFA</p>
                        </div>
                    </button>
                    <button
                        className="action-card"
                        onClick={() => setShowAllDevicesConfirm(true)}
                        disabled={clearingDevices || mfa.devices?.length === 0}
                    >
                        <FiTrash2 className="action-icon" />
                        <div className="action-info">
                            <strong>Clear All Devices</strong>
                            <p>Remove all MFA devices but keep MFA enabled status</p>
                        </div>
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
                        <p>This action will:</p>
                        <ul>
                            <li>Remove all MFA devices ({mfa.devices?.length || 0} devices)</li>
                            <li>Invalidate all backup codes ({mfa.backup_codes?.remaining || 0} codes)</li>
                            <li>Disable MFA for this user</li>
                            <li>Send email notification to the user</li>
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
                        <p>Are you sure you want to remove "{showDeviceConfirm.name}"?</p>
                        <p className="warning-text">The user will need to re-add this device.</p>
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

            {/* Clear All Devices Confirmation Modal */}
            {showAllDevicesConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Clear All Devices?</h3>
                        </div>
                        <p>This will remove all {mfa.devices?.length || 0} MFA device(s) from this user.</p>
                        <p className="warning-text">MFA will remain enabled if the user has verified devices.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowAllDevicesConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleClearAllDevices}>
                                Yes, Clear All Devices
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMFAStatus;