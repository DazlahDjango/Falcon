import React from 'react';
import { FiMonitor, FiSmartphone, FiTablet, FiMapPin, FiClock, FiMoreVertical } from 'react-icons/fi';
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
        return 'Unkown location';
    };
    return (
        <div className={`session-card ${isCurrent ? 'current' : ''}`}>
            <div className="session-header">
                <div className="session-device">
                    {getDeviceIcon()}
                    <div className="device-info">
                        <span className="device-name">{session.browser || 'Unknown Browser'}</span>
                        <span className="device-os">{session.os || 'Unknown OS'}</span>
                    </div>
                </div>
                <div className="session-actions">
                    {!isCurrent && (
                        <button className="terminate-btn" onClick={onTerminate}>
                            Terminate
                        </button>
                    )}
                    <button className="details-btn" onClick={onViewDetails}>
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
                    <span>Last active: {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}</span>
                </div>
            </div>
            
            {isCurrent && (
                <div className="current-badge">Current Session</div>
            )}
            
            {session.mfa_verified && (
                <div className="mfa-badge">MFA Verified</div>
            )}
        </div>
    );
};
export default SessionCard;