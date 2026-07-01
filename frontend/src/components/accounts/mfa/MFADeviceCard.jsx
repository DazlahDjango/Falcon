import React, { useState } from 'react';
import {
  FiSmartphone,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiTrash2,
  FiMoreVertical,
  FiEdit,
  FiShield,
  FiClock,
} from 'react-icons/fi';
import { MFA_DEVICE_TYPE_LABELS } from '../../../config/constants/accountsApiConstants';

export const MFADeviceCard = ({ device, onDelete, onSetPrimary, isLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getDeviceIcon = () => {
    const icons = {
      totp: FiShield,
      sms: FiSmartphone,
      email: FiSmartphone,
      hardware: FiShield,
    };
    const Icon = icons[device.device_type] || FiSmartphone;
    return <Icon className="device-icon" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`mfa-device-card ${device.is_primary ? 'primary' : ''}`}>
      <div className="device-card-header">
        <div className="device-icon-wrapper">{getDeviceIcon()}</div>
        <div className="device-info">
          <span className="device-name">{device.name}</span>
          <span className="device-type">{MFA_DEVICE_TYPE_LABELS[device.device_type] || device.device_type}</span>
        </div>
        <div className="device-status">
          {device.is_primary && (
            <span className="primary-badge">
              <FiStar /> Primary
            </span>
          )}
          {device.is_verified ? (
            <span className="verified-badge">
              <FiCheckCircle /> Verified
            </span>
          ) : (
            <span className="unverified-badge">
              <FiXCircle /> Unverified
            </span>
          )}
          {device.is_locked && (
            <span className="locked-badge">
              <FiXCircle /> Locked
            </span>
          )}
        </div>
      </div>

      <div className="device-card-body">
        <div className="device-details">
          <div className="device-detail">
            <span className="detail-label">Created</span>
            <span className="detail-value">{formatDate(device.created_at)}</span>
          </div>
          {device.last_used_at && (
            <div className="device-detail">
              <span className="detail-label">Last Used</span>
              <span className="detail-value">{formatDate(device.last_used_at)}</span>
            </div>
          )}
          {device.verified_at && (
            <div className="device-detail">
              <span className="detail-label">Verified</span>
              <span className="detail-value">{formatDate(device.verified_at)}</span>
            </div>
          )}
          {device.fail_count > 0 && (
            <div className="device-detail">
              <span className="detail-label">Failed Attempts</span>
              <span className="detail-value">{device.fail_count}</span>
            </div>
          )}
        </div>
      </div>

      <div className="device-card-actions">
        {!device.is_primary && device.is_verified && !device.is_locked && (
          <button
            className="action-btn primary-action"
            onClick={onSetPrimary}
            disabled={isLoading}
          >
            <FiStar /> Set Primary
          </button>
        )}
        <button
          className="action-btn delete-action"
          onClick={onDelete}
          disabled={isLoading}
        >
          <FiTrash2 /> Remove
        </button>
      </div>
    </div>
  );
};

export default MFADeviceCard;
