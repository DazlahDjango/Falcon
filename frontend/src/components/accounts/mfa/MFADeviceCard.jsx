import React, { useState } from 'react';
import {
    FiSmartphone, FiMail, FiPhone, FiCpu,
    FiStar, FiTrash2, FiCheckCircle, FiAlertCircle, FiClock
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
        case 'totp':
            return <FiSmartphone />;
        case 'email':
            return <FiMail />;
        case 'sms':
            return <FiPhone />;
        case 'hardware':
            return <FiCpu />;
        default:
            return <FiSmartphone />;
    }
};

const MFADeviceCard = ({ device, onRemove, onSetPrimary }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const getStatusBadge = () => {
        if (device.is_primary) {
            return <span className="badge-primary"><FiStar /> Primary</span>;
        }
        if (device.is_locked) {
            return <span className="badge-warning"><FiAlertCircle /> Locked</span>;
        }
        if (device.is_verified) {
            return <span className="badge-success"><FiCheckCircle /> Verified</span>;
        }
        return <span className="badge-secondary"><FiClock /> Pending</span>;
    };

    const getLastUsedText = () => {
        if (!device.last_used_at) return 'Never used';
        return `Last used ${formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true })}`;
    };

    return (
        <div className={`mfa-device-card ${device.is_primary ? 'primary' : ''}`}>
            <div className="device-icon">
                {getDeviceIcon(device.device_type)}
            </div>

            <div className="device-info">
                <div className="device-name">
                    {device.name}
                    {device.device_type === 'totp' && device.is_verified && (
                        <span className="verified-badge">✓</span>
                    )}
                </div>
                <div className="device-details">
                    {device.phone && <span className="device-contact">{device.phone}</span>}
                    {device.email && <span className="device-contact">{device.email}</span>}
                </div>
                <div className="device-meta">
                    <span className="last-used">
                        <FiClock size={12} />
                        {getLastUsedText()}
                    </span>
                </div>
            </div>

            <div className="device-status">
                {getStatusBadge()}
            </div>

            <div className="device-actions">
                {!device.is_primary && device.is_verified && device.is_active && (
                    <button
                        className="btn-icon"
                        onClick={() => onSetPrimary(device.id)}
                        title="Set as primary"
                    >
                        <FiStar />
                    </button>
                )}
                <button
                    className="btn-icon danger"
                    onClick={() => setShowConfirm(true)}
                    title="Remove device"
                >
                    <FiTrash2 />
                </button>
            </div>

            {/* Remove Confirmation Dialog */}
            {showConfirm && (
                <div className="device-confirm-overlay">
                    <div className="device-confirm-dialog">
                        <p>Remove "{device.name}"?</p>
                        <div className="confirm-actions">
                            <button onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button onClick={() => {
                                onRemove(device.id, device.name);
                                setShowConfirm(false);
                            }} className="danger">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MFADeviceCard;