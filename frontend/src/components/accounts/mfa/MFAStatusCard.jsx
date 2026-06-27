import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiPlus,
  FiKey,
  FiSmartphone,
  FiRefreshCw,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMFA';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const MFAStatusCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getStatus,
    mfaStatus,
    isLoading,
    error,
    clearMfaError,
    isEnabled,
    hasDevices,
    backupCodesRemaining,
  } = useMFA();

  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    clearMfaError();
    const result = await getStatus();
    if (result.success !== false) {
      setStatus(result);
    }
  };

  const statusData = status || mfaStatus;

  if (isLoading && !statusData) {
    return (
      <div className="mfa-status-loading">
        <div className="spinner-sm" />
        <span>Loading MFA status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mfa-status-error">
        <FiAlertTriangle className="error-icon" />
        <span>{error}</span>
        <button className="btn-secondary-sm" onClick={loadStatus}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  const isMfaEnabled = statusData?.enabled || isEnabled;
  const hasActiveDevices = statusData?.has_active_devices || hasDevices;
  const backupCodes = statusData?.backup_codes_remaining || backupCodesRemaining;

  return (
    <div className="mfa-status-card">
      <div className="mfa-status-header">
        <div className="mfa-status-title">
          <FiShield className="title-icon" />
          <h3>Multi-Factor Authentication</h3>
        </div>
        <div className={`mfa-status-badge ${isMfaEnabled ? 'enabled' : 'disabled'}`}>
          {isMfaEnabled ? (
            <>
              <FiCheckCircle /> Enabled
            </>
          ) : (
            <>
              <FiXCircle /> Disabled
            </>
          )}
        </div>
      </div>

      <div className="mfa-status-body">
        <div className="mfa-status-grid">
          <div className="mfa-status-item">
            <span className="mfa-status-label">Devices</span>
            <span className="mfa-status-value">{hasActiveDevices ? 'Active' : 'None'}</span>
          </div>
          <div className="mfa-status-item">
            <span className="mfa-status-label">Backup Codes</span>
            <span className="mfa-status-value">{backupCodes} remaining</span>
          </div>
          <div className="mfa-status-item">
            <span className="mfa-status-label">Primary Device</span>
            <span className="mfa-status-value">
              {statusData?.primary_device?.name || 'None'}
            </span>
          </div>
        </div>

        <div className="mfa-status-actions">
          {!isMfaEnabled && (
            <button
              className="btn-primary"
              onClick={() => navigate(ACCOUNTS_ROUTES.MFA_SETUP)}
            >
              <FiPlus /> Enable MFA
            </button>
          )}
          {isMfaEnabled && (
            <>
              <button
                className="btn-secondary"
                onClick={() => navigate(ACCOUNTS_ROUTES.MFA_DEVICES)}
              >
                <FiSmartphone /> Manage Devices
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate(ACCOUNTS_ROUTES.MFA_BACKUP_CODES)}
              >
                <FiKey /> Backup Codes
              </button>
            </>
          )}
        </div>
      </div>

      {isMfaEnabled && (
        <div className="mfa-status-footer">
          <FiLock className="footer-icon" />
          <span>Your account is protected with 2FA</span>
        </div>
      )}
      {!isMfaEnabled && (
        <div className="mfa-status-footer warning">
          <FiUnlock className="footer-icon" />
          <span>MFA is not enabled. Enable it for extra security.</span>
        </div>
      )}
    </div>
  );
};

export default MFAStatusCard;
