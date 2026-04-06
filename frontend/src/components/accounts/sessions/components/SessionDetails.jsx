import React from 'react';
import { format } from 'date-fns';
import { FiX, FiMapPin, FiClock, FiMonitor, FiSmartphone, FiTablet, FiShield } from 'react-icons/fi';
import Modal from '../../../common/UI/Modal';

const SessionDetails = ({ session, isOpen, onClose, onTerminate }) => {
    if (!session) return null;
    
    const getDeviceIcon = () => {
        switch (session.device_type) {
            case 'mobile': return <FiSmartphone size={24} />;
            case 'tablet': return <FiTablet size={24} />;
            default: return <FiMonitor size={24} />;
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
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Session Details" size="sm">
            <div className="session-details-modal">
                <div className="session-device-large">
                    {getDeviceIcon()}
                    <div>
                        <h4>{session.browser || 'Unknown Browser'}</h4>
                        <p>{session.os || 'Unknown OS'}</p>
                    </div>
                </div>
                
                <div className="details-grid">
                    <div className="detail-item">
                        <FiMapPin className="detail-icon" />
                        <div>
                            <label>Location</label>
                            <span>{getLocationDisplay()}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <div>
                            <label>Login Time</label>
                            <span>{format(new Date(session.login_time), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <div>
                            <label>Last Activity</label>
                            <span>{format(new Date(session.last_activity), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiShield className="detail-icon" />
                        <div>
                            <label>Security</label>
                            <span>
                                {session.mfa_verified ? 'MFA Verified' : 'MFA Not Verified'}
                                {session.is_trusted_device && ' · Trusted Device'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="session-ip">
                    <label>IP Address</label>
                    <code>{session.ip_address}</code>
                </div>
                
                <div className="session-user-agent">
                    <label>User Agent</label>
                    <code>{session.user_agent}</code>
                </div>
                
                {session.security_alerts && session.security_alerts.length > 0 && (
                    <div className="security-alerts">
                        <label>Security Alerts</label>
                        {session.security_alerts.map((alert, index) => (
                            <div key={index} className="alert-item">
                                <FiShield size={12} />
                                <span>{alert.type}: {alert.details}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {!session.is_current && (
                        <button className="btn btn-danger" onClick={onTerminate}>
                            Terminate Session
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SessionDetails;