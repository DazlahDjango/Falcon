import React, { useState, useEffect, useCallback } from 'react';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { useDispatch } from 'react-redux';
import MFADeviceList from './MFADeviceList';
import MFATotpSetup from './MFATotpSetup';
import MFABackupCodes from './MFABackupCodes';
import MFAActivityLog from './MFAActivityLog';
import MFAStatusBadge from './MFAStatusBadge';
import Spinner from '../../common/UI/Spinner';

const MFADeviceManager = () => {
    const dispatch = useDispatch();
    const {
        devices,
        devicesLoading,
        isMfaEnabled,
        status,
        loadDevices,
        loadMfaStatus,
        removeDevice,
        setAsPrimary,
        disableAllMfa,
        clearErrors,
    } = useMFA();

    const [activeTab, setActiveTab] = useState('devices');
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadDevices();
        loadMfaStatus();
    }, [loadDevices, loadMfaStatus]);

    const handleRemoveDevice = async (deviceId, deviceName) => {
        if (window.confirm(`Are you sure you want to remove "${deviceName}"?`)) {
            try {
                await removeDevice(deviceId);
                dispatch(showAlert({ type: 'success', message: `${deviceName} removed successfully` }));
            } catch (error) {
                dispatch(showAlert({ type: 'error', message: 'Failed to remove device' }));
            }
        }
    };

    const handleSetPrimary = async (deviceId) => {
        try {
            await setAsPrimary(deviceId);
            dispatch(showAlert({ type: 'success', message: 'Primary device updated' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to set primary device' }));
        }
    };

    const handleDisableAllMfa = async () => {
        try {
            await disableAllMfa();
            dispatch(showAlert({ type: 'success', message: 'MFA disabled for all devices' }));
            setShowDisableConfirm(false);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to disable MFA' }));
        }
    };

    if (devicesLoading && !devices.length) {
        return (
            <div className="mfa-loading">
                <Spinner size="lg" />
                <p>Loading MFA devices...</p>
            </div>
        );
    }

    return (
        <div className="mfa-device-manager">
            {/* Header */}
            <div className="mfa-header">
                <div>
                    <h2>Multi-Factor Authentication</h2>
                    <p>Manage your MFA devices and security settings</p>
                </div>
                <MFAStatusBadge enabled={isMfaEnabled} />
            </div>

            {/* Stats Cards */}
            <div className="mfa-stats">
                <div className="stat-card">
                    <div className="stat-value">{devices.filter(d => d.is_active).length}</div>
                    <div className="stat-label">Active Devices</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{devices.filter(d => d.is_primary).length}</div>
                    <div className="stat-label">Primary Device</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{status?.backup_codes_remaining || 0}</div>
                    <div className="stat-label">Backup Codes Left</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mfa-tabs">
                <button
                    className={`tab-btn ${activeTab === 'devices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('devices')}
                >
                    Devices
                </button>
                <button
                    className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('backup')}
                >
                    Backup Codes
                </button>
                <button
                    className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    Activity Log
                </button>
            </div>

            {/* Tab Content */}
            <div className="mfa-tab-content">
                {activeTab === 'devices' && (
                    <>
                        {!isMfaEnabled && !showTotpSetup ? (
                            <div className="mfa-setup-prompt">
                                <div className="prompt-icon">🔒</div>
                                <h3>Secure your account with MFA</h3>
                                <p>Add an extra layer of security to protect your account</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowTotpSetup(true)}
                                >
                                    Set up MFA
                                </button>
                            </div>
                        ) : showTotpSetup ? (
                            <MFATotpSetup
                                onSuccess={() => {
                                    setShowTotpSetup(false);
                                    loadDevices();
                                    loadMfaStatus();
                                }}
                                onCancel={() => setShowTotpSetup(false)}
                            />
                        ) : (
                            <MFADeviceList
                                devices={devices}
                                onRemove={handleRemoveDevice}
                                onSetPrimary={handleSetPrimary}
                                onAddDevice={() => setShowTotpSetup(true)}
                            />
                        )}

                        {isMfaEnabled && devices.length > 0 && (
                            <div className="mfa-danger-zone">
                                <h4>Danger Zone</h4>
                                <div className="danger-action">
                                    <div>
                                        <strong>Disable MFA</strong>
                                        <p>This will remove all MFA protection from your account</p>
                                    </div>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => setShowDisableConfirm(true)}
                                    >
                                        Disable All MFA
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'backup' && (
                    <MFABackupCodes
                        onGenerate={() => loadMfaStatus()}
                    />
                )}

                {activeTab === 'activity' && (
                    <MFAActivityLog />
                )}
            </div>

            {/* Disable MFA Confirmation Modal */}
            {showDisableConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Disable MFA?</h3>
                        <p>Are you sure you want to disable Multi-Factor Authentication?</p>
                        <p className="warning-text">
                            This will make your account less secure. You can re-enable MFA anytime.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowDisableConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDisableAllMfa}>
                                Yes, Disable MFA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MFADeviceManager;