import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShield, FiX, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useWebSocket } from '../../../hooks/accounts/useWebSocket';
import {
    selectSecurityBanner,
    selectSecurityWsConnected,
} from '../../../store/accounts/selectors/securitySelectors';
import { clearSecurityBanner, setSecurityEvent } from '../../../store/accounts/slice/securitySlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

export const GlobalSecurityBanner = () => {
    const dispatch = useDispatch();
    const banner = useSelector(selectSecurityBanner);
    const wsConnected = useSelector(selectSecurityWsConnected);
    const [timeVisible, setTimeVisible] = useState(null);
    
    // WebSocket connection for real-time security events
    const { isConnected, lastMessage, sendMessage } = useWebSocket('security', {
        autoConnect: true,
        onMessage: (data) => {
            if (data.event === 'security_alert') {
                dispatch(setSecurityEvent(data));
                dispatch(showAlert({
                    type: data.severity === 'critical' ? 'error' : 'warning',
                    message: data.message,
                    duration: 10000,
                }));
            }
        },
    });

    useEffect(() => {
        if (banner?.timestamp) {
            setTimeVisible(new Date(banner.timestamp));
            // Auto-dismiss banner after 30 seconds if not critical
            if (banner.type !== 'critical') {
                const timer = setTimeout(() => {
                    dispatch(clearSecurityBanner());
                }, 30000);
                return () => clearTimeout(timer);
            }
        }
    }, [banner, dispatch]);

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    };

    const getBannerStyles = () => {
        switch (banner?.type) {
            case 'error':
            case 'critical':
                return {
                    containerClass: 'security-banner critical',
                    icon: <FiAlertCircle className="banner-icon critical" />,
                };
            case 'warning':
                return {
                    containerClass: 'security-banner warning',
                    icon: <FiShield className="banner-icon warning" />,
                };
            case 'success':
                return {
                    containerClass: 'security-banner success',
                    icon: <FiCheckCircle className="banner-icon success" />,
                };
            default:
                return {
                    containerClass: 'security-banner info',
                    icon: <FiShield className="banner-icon info" />,
                };
        }
    };

    if (!banner) return null;

    const bannerStyles = getBannerStyles();

    return (
        <div className={bannerStyles.containerClass} role="alert">
            <div className="banner-content">
                <div className="banner-icon-wrapper">
                    {bannerStyles.icon}
                </div>
                <div className="banner-message">
                    <div className="banner-title">
                        {banner.title || (banner.type === 'critical' ? 'Security Alert' : 'Security Notice')}
                    </div>
                    {banner.message && (
                        <div className="banner-description">{banner.message}</div>
                    )}
                    {banner.details && (
                        <div className="banner-details">
                            {Object.entries(banner.details).map(([key, value]) => (
                                <span key={key} className="detail-tag">
                                    {key}: {value}
                                </span>
                            ))}
                        </div>
                    )}
                    {timeVisible && (
                        <div className="banner-time">
                            <FiClock size={12} />
                            <span>{getTimeAgo(timeVisible)}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="banner-actions">
                {/* Connection Status Indicator */}
                <div 
                    className={`connection-status ${wsConnected && isConnected ? 'connected' : 'disconnected'}`}
                    title={wsConnected && isConnected ? 'Security channel live' : 'Security channel offline'}
                >
                    <span className="status-dot" />
                    <span className="status-text">
                        {wsConnected && isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
                
                {/* Action Buttons */}
                {banner.actions && banner.actions.map((action, index) => (
                    <button
                        key={index}
                        className="banner-action-btn"
                        onClick={() => {
                            if (action.onClick) action.onClick();
                            if (action.navigate) window.location.href = action.navigate;
                        }}
                    >
                        {action.label}
                    </button>
                ))}
                
                {/* Dismiss Button */}
                {(banner.dismissible !== false) && (
                    <button
                        type="button"
                        className="banner-close-btn"
                        onClick={() => dispatch(clearSecurityBanner())}
                        aria-label="Dismiss"
                    >
                        <FiX size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GlobalSecurityBanner;