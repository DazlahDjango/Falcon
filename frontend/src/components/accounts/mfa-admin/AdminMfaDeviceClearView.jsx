import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiArrowLeft, FiSmartphone, FiTrash2, FiShield,
    FiCheckCircle, FiLock, FiClock, FiAlertCircle
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';

const AdminMfaDeviceClearView = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        adminMFAStatus,
        adminMFAStatusLoading,
        clearingDevices,
        loadAdminMFAStatus,
        clearUserDevices,
    } = useAdminMFA();

    const [showDeviceConfirm, setShowDeviceConfirm] = useState(null);
    const [showAllConfirm, setShowAllConfirm] = useState(false);

    useEffect(() => {
        if (userId) {
            loadAdminMFAStatus(userId);
        }
    }, [userId, loadAdminMFAStatus]);

    const handleClearDevice = async (deviceId, deviceName) => {
        try {
            await clearUserDevices(userId, deviceId);
            setShowDeviceConfirm(null);
            await loadAdminMFAStatus(userId);
            dispatch(showAlert({ 
                type: 'success', 
                message: `${deviceName} removed successfully` 
            }));
        } catch (error) {
            dispatch(showAlert({ 
                type: 'error', 
                message: error || 'Failed to remove device' 
            }));
        }
    };

    const handleClearAllDevices = async () => {
        try {
            await clearUserDevices(userId);
            setShowAllConfirm(false);
            await loadAdminMFAStatus(userId);
            dispatch(showAlert({ 
                type: 'success', 
                message: 'All MFA devices cleared' 
            }));
        } catch (error) {
            dispatch(showAlert({ 
                type: 'error', 
                message: error || 'Failed to clear devices' 
            }));
        }
    };

    const getDeviceStatusIcon = (device) => {
        if (device.is_verified && device.is_active) {
            return <FiCheckCircle className="device-status success" />;
        }
        if (device.is_locked) {
            return <FiLock className="device-status warning" />;
        }
        return <FiShield className="device-status muted" />;
    };

    if (adminMFAStatusLoading) {
        return (
            <div className="mfa-admin-loading">
                <Spinner size="lg" />
                <p>Loading devices...</p>
            </div>
        );
    }

    const user = adminMFAStatus?.user || {};
    const devices = adminMFAStatus?.mfa?.devices || [];

    return (
        <div className="mfa-admin-container">
            {/* Header */}
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin/mfa/users')}>
                    <FiArrowLeft /> Back to Users
                </button>
                <h1>Manage MFA Devices</h1>
                <p>Remove MFA devices for {user.full_name || user.email}</p>
            </div>

            {/* Stats */}
            <div className="device-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FiSmartphone /></div>
                    <div className="stat-info">
                        <div className="stat-value">{devices.length}</div>
                        <div className="stat-label">Total Devices</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiCheckCircle /></div>
                    <div className="stat-info">
                        <div className="stat-value">{devices.filter(d => d.is_verified).length}</div>
                        <div className="stat-label">Verified Devices</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiLock /></div>
                    <div className="stat-info">
                        <div className="stat-value">{devices.filter(d => d.is_locked).length}</div>
                        <div className="stat-label">Locked Devices</div>
                    </div>
                </div>
            </div>

            {/* Devices List */}
            <div className="devices-section">
                <div className="section-header">
                    <h3><FiSmartphone /> MFA Devices</h3>
                    {devices.length > 0 && (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setShowAllConfirm(true)}
                            disabled={clearingDevices}
                        >
                            {clearingDevices ? <Spinner size="sm" /> : <FiTrash2 />}
                            Clear All Devices
                        </button>
                    )}
                </div>

                {devices.length > 0 ? (
                    <div className="devices-list">
                        {devices.map((device) => (
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
                                        <span className="device-status">
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
                        <p>No MFA devices found for this user</p>
                    </div>
                )}
            </div>

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

            {/* Clear All Confirmation Modal */}
            {showAllConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Clear All Devices?</h3>
                        </div>
                        <p>This will remove all {devices.length} MFA device(s) from this user.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowAllConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleClearAllDevices}>
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMfaDeviceClearView;