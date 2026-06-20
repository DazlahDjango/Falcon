import React from 'react';
import { FiShield, FiShieldOff } from 'react-icons/fi';

const MFAStatusBadge = ({ enabled, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : 'badge-md';

    return (
        <div className={`mfa-status-badge ${enabled ? 'enabled' : 'disabled'} ${sizeClass}`}>
            {enabled ? (
                <>
                    <FiShield />
                    <span>MFA Enabled</span>
                </>
            ) : (
                <>
                    <FiShieldOff />
                    <span>MFA Disabled</span>
                </>
            )}
        </div>
    );
};

export default MFAStatusBadge;