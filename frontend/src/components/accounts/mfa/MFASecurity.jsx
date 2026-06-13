import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiSmartphone, FiCode } from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMfa';
import MFAStatusBadge from './MFAStatusBadge';

const MFASecurity = ({ compact = false }) => {
    const navigate = useNavigate();
    const { isMfaEnabled, devices, backupCodesRemaining, loadMfaStatus } = useMFA();

    React.useEffect(() => {
        loadMfaStatus();
    }, [loadMfaStatus]);

    if (compact) {
        return (
            <div className="mfa-security-compact">
                <div className="mfa-status-row">
                    <MFAStatusBadge enabled={isMfaEnabled} size="sm" />
                    <button
                        className="btn-link"
                        onClick={() => navigate('/security/mfa')}
                    >
                        Manage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mfa-security">
            <div className="security-header">
                <h3>Multi-Factor Authentication</h3>
                <MFAStatusBadge enabled={isMfaEnabled} />
            </div>

            <div className="security-stats">
                <div className="stat">
                    <FiSmartphone />
                    <span>{devices?.filter(d => d.is_active).length || 0} Active Devices</span>
                </div>
                <div className="stat">
                    <FiCode />
                    <span>{backupCodesRemaining || 0} Backup Codes Remaining</span>
                </div>
            </div>

            <button
                className="btn btn-secondary"
                onClick={() => navigate('/security/mfa')}
            >
                Manage MFA Settings
            </button>
        </div>
    );
};

export default MFASecurity;