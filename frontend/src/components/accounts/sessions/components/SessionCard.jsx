import React from 'react';
import { 
    FiMonitor, FiSmartphone, FiTablet, FiMapPin, 
    FiClock, FiMoreVertical, FiShield, FiCheckCircle 
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const SessionCard = ({ session, onTerminate, onViewDetails, isCurrent }) => {
    const getDeviceIcon = () => {
        switch (session.device_type) {
            case 'mobile': return <FiSmartphone size={20} />;
            case 'tablet': return <FiTablet size={20} />;
            default: return <FiMonitor size={20} />;
        }
    };

    const getLocationDisplay = () => {
        if (session.location_city && session.location_country) {
            return `${session.location_city}, ${session.location_country}`;
        }
        if (session.location_country) {
            return session.location_country;
        }
        return 'Unknown location';
    };

    const getDeviceName = () => {
        const parts = [];
        if (session.browser && session.browser !== 'Unknown') parts.push(session.browser);
        if (session.os && session.os !== 'Unknown') parts.push(session.os);
        return parts.length > 0 ? parts.join(' · ') : 'Unknown Device';
    };

    return (
        <div className={`session-card ${isCurrent ? 'current' : ''}`}>
            <div className="session-header">
                <div className="session-device">
                    <div className="device-icon">
                        {getDeviceIcon()}
                    </div>
                    <div className="device-info">
                        <span className="device-name">{getDeviceName()}</span>
                        <span className="device-ip">{session.ip_address}</span>
                    </div>
                </div>
                <div className="session-actions">
                    {!isCurrent && (
                        <button 
                            className="terminate-btn" 
                            onClick={onTerminate}
                            title="Terminate this session"
                        >
                            Terminate
                        </button>
                    )}
                    <button 
                        className="details-btn" 
                        onClick={onViewDetails}
                        title="View session details"
                    >
                        <FiMoreVertical size={16} />
                    </button>
                </div>
            </div>
            
            <div className="session-details">
                <div className="detail-row">
                    <FiMapPin size={14} />
                    <span>{getLocationDisplay()}</span>
                </div>
                <div className="detail-row">
                    <FiClock size={14} />
                    <span>
                        Last active: {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                    </span>
                </div>
                {session.mfa_verified && (
                    <div className="detail-row">
                        <FiShield size={14} />
                        <span>MFA Verified</span>
                    </div>
                )}
            </div>
            
            {isCurrent && (
                <div className="current-badge">
                    <FiCheckCircle size={12} />
                    Current Session
                </div>
            )}
        </div>
    );
};

export default SessionCard;