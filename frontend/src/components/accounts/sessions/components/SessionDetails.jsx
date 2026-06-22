import React from 'react';
import { format } from 'date-fns';
import { 
    FiX, FiMapPin, FiClock, FiMonitor, FiSmartphone, 
    FiTablet, FiShield, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi';
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

    const getDeviceName = () => {
        const parts = [];
        if (session.browser && session.browser !== 'Unknown') parts.push(session.browser);
        if (session.os && session.os !== 'Unknown') parts.push(session.os);
        return parts.length > 0 ? parts.join(' · ') : 'Unknown Device';
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

    const getDuration = () => {
        if (!session.login_time) return 'Unknown';
        const start = new Date(session.login_time);
        const end = session.logout_time ? new Date(session.logout_time) : new Date();
        const hours = Math.floor((end - start) / 3600000);
        const minutes = Math.floor(((end - start) % 3600000) / 60000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const isSessionExpired = () => {
        if (!session.expires_at) return false;
        return new Date(session.expires_at) < new Date();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Session Details" size="md">
            <div className="session-details-modal">
                {/* Device Section */}
                <div className="session-device-large">
                    <div className="device-icon-large">
                        {getDeviceIcon()}
                    </div>
                    <div className="device-info-large">
                        <h4>{getDeviceName()}</h4>
                        <p className="device-ip">{session.ip_address}</p>
                    </div>
                </div>
                
                {/* Details Grid */}
                <div className="details-grid">
                    <div className="detail-item">
                        <FiMapPin className="detail-icon" />
                        <div className="detail-content">
                            <label>Location</label>
                            <span>{getLocationDisplay()}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <div className="detail-content">
                            <label>Login Time</label>
                            <span>{format(new Date(session.login_time), 'MMM dd, yyyy HH:mm:ss')}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <div className="detail-content">
                            <label>Last Activity</label>
                            <span>{format(new Date(session.last_activity), 'MMM dd, yyyy HH:mm:ss')}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <div className="detail-content">
                            <label>Duration</label>
                            <span>{getDuration()}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiShield className="detail-icon" />
                        <div className="detail-content">
                            <label>MFA Status</label>
                            <span className={session.mfa_verified ? 'verified' : 'unverified'}>
                                {session.mfa_verified ? (
                                    <>
                                        <FiCheckCircle size={12} /> Verified
                                    </>
                                ) : (
                                    <>
                                        <FiAlertCircle size={12} /> Not Verified
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiShield className="detail-icon" />
                        <div className="detail-content">
                            <label>Trusted Device</label>
                            <span>{session.is_trusted_device ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <div className="detail-content">
                            <label>Expires</label>
                            <span className={isSessionExpired() ? 'expired' : ''}>
                                {session.expires_at ? format(new Date(session.expires_at), 'MMM dd, yyyy HH:mm:ss') : 'Never'}
                                {isSessionExpired() && ' (Expired)'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <FiShield className="detail-icon" />
                        <div className="detail-content">
                            <label>Status</label>
                            <span className={`status-${session.status}`}>
                                {session.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* User Agent */}
                {session.user_agent && (
                    <div className="session-user-agent">
                        <label>User Agent</label>
                        <code>{session.user_agent}</code>
                    </div>
                )}
                
                {/* Security Alerts */}
                {session.security_alerts && session.security_alerts.length > 0 && (
                    <div className="security-alerts">
                        <label>Security Alerts</label>
                        <div className="alerts-list">
                            {session.security_alerts.map((alert, index) => (
                                <div key={index} className="alert-item">
                                    <FiAlertCircle size={12} />
                                    <span>
                                        {alert.type}: {alert.details || alert.message || 'Security event detected'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Session ID */}
                <div className="session-id">
                    <label>Session ID</label>
                    <code>{session.id}</code>
                </div>
                
                {/* Actions */}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {!session.is_current && session.status === 'active' && (
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