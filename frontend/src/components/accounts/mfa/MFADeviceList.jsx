import React, { useState, useEffect } from 'react';
import {
  FiSmartphone,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiTrash2,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMFA';
import { MFADeviceCard } from './MFADeviceCard';
import { MFASetupModal } from './MFASetupModal';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const MFADeviceList = () => {
  const {
    getDevices,
    devices,
    isLoading,
    error,
    clearMfaError,
    deleteDevice,
    setPrimary,
  } = useMFA();

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    clearMfaError();
    await getDevices();
  };

  const handleDelete = async (deviceId) => {
    if (!confirm('Are you sure you want to remove this device?')) return;
    setActionLoading(true);
    try {
      await deleteDevice(deviceId);
      await loadDevices();
    } catch (err) {
      console.error('Failed to delete device:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimary = async (deviceId) => {
    setActionLoading(true);
    try {
      await setPrimary(deviceId);
      await loadDevices();
    } catch (err) {
      console.error('Failed to set primary device:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && devices.length === 0) {
    return (
      <div className="mfa-device-loading">
        <div className="spinner-sm" />
        <span>Loading devices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mfa-device-error">
        <FiAlertTriangle className="error-icon" />
        <span>{error}</span>
        <button className="btn-secondary-sm" onClick={loadDevices}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mfa-device-list">
      <div className="mfa-device-header">
        <div className="mfa-device-title">
          <FiSmartphone className="title-icon" />
          <h3>MFA Devices ({devices.length})</h3>
        </div>
        <div className="mfa-device-actions">
          <button className="btn-icon" onClick={loadDevices}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="btn-primary-sm" onClick={() => setShowSetupModal(true)}>
            <FiPlus /> Add Device
          </button>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="mfa-device-empty">
          <FiShield className="empty-icon" />
          <p>No MFA devices configured</p>
          <p className="empty-hint">Add a device to enable two-factor authentication</p>
          <button className="btn-primary" onClick={() => setShowSetupModal(true)}>
            <FiPlus /> Add Device
          </button>
        </div>
      ) : (
        <div className="mfa-device-grid">
          {devices.map((device) => (
            <MFADeviceCard
              key={device.id}
              device={device}
              onDelete={() => handleDelete(device.id)}
              onSetPrimary={() => handleSetPrimary(device.id)}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {showSetupModal && (
        <MFASetupModal
          onClose={() => setShowSetupModal(false)}
          onSuccess={() => {
            setShowSetupModal(false);
            loadDevices();
          }}
        />
      )}
    </div>
  );
};

export default MFADeviceList;
