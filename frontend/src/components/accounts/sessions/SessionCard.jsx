import React, { useState } from 'react';
import {
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiLogOut,
  FiMapPin,
  FiGlobe,
  FiAlertCircle,
} from 'react-icons/fi';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { UserAvatar } from '../common/UserAvatar';

export const SessionCard = ({ session, onRefresh }) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { terminateSession } = useSessions();
  const [terminating, setTerminating] = useState(false);

  const getDeviceIcon = (deviceType) => {
    const icons = {
      desktop: FiMonitor,
      mobile: FiSmartphone,
      tablet: FiTablet,
      unknown: FiMonitor,
    };
    const Icon = icons[deviceType] || FiMonitor;
    return <Icon className="device-icon" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="status-badge active"><FiCheckCircle /> Active</span>,
      expired: <span className="status-badge expired"><FiClock /> Expired</span>,
      revoked: <span className="status-badge revoked"><FiXCircle /> Revoked</span>,
    };
    return badges[status] || <span className="status-badge default">{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTerminate = async () => {
    setTerminating(true);
    try {
      await terminateSession(session.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to terminate session:', err);
    } finally {
      setTerminating(false);
    }
  };

  const canTerminate = () => {
    if (isSuperAdmin) return true;
    if (isAdmin) return true;
    return !session.is_current;
  };

  return (
    <div className={`session-card ${session.is_current ? 'current' : ''}`}>
      <div className="session-card-header">
        <div className="session-user">
          <UserAvatar user={session.user} size="md" />
          <div className="session-user-info">
            <span className="session-user-name">
              {session.user?.full_name || session.user?.email || 'Unknown'}
            </span>
            <span className="session-user-email">{session.user?.email}</span>
          </div>
        </div>
        <div className="session-card-status">
          {getStatusBadge(session.status)}
          {session.is_current && (
            <span className="current-badge">Current</span>
          )}
        </div>
      </div>

      <div className="session-card-body">
        <div className="session-details">
          <div className="session-detail">
            <span className="detail-label">Device</span>
            <span className="detail-value">
              {getDeviceIcon(session.device_type)}
              {session.device_type || 'Unknown'}
            </span>
          </div>
          <div className="session-detail">
            <span className="detail-label">IP Address</span>
            <span className="detail-value">
              <FiGlobe className="detail-icon" />
              {session.ip_address || '-'}
            </span>
          </div>
          <div className="session-detail">
            <span className="detail-label">Browser</span>
            <span className="detail-value">{session.browser || '-'}</span>
          </div>
          <div className="session-detail">
            <span className="detail-label">OS</span>
            <span className="detail-value">{session.os || '-'}</span>
          </div>
          <div className="session-detail">
            <span className="detail-label">Login Time</span>
            <span className="detail-value">{formatDate(session.login_time)}</span>
          </div>
          <div className="session-detail">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{session.duration || '-'}</span>
          </div>
          {session.mfa_verified && (
            <div className="session-detail">
              <span className="detail-label">MFA</span>
              <span className="detail-value verified">✓ Verified</span>
            </div>
          )}
          {session.is_trusted_device && (
            <div className="session-detail">
              <span className="detail-label">Trusted</span>
              <span className="detail-value trusted">✓ Trusted Device</span>
            </div>
          )}
        </div>
      </div>

      {session.status === 'active' && canTerminate() && (
        <div className="session-card-actions">
          <button
            className="terminate-btn"
            onClick={handleTerminate}
            disabled={terminating}
          >
            {terminating ? (
              <>
                <span className="spinner-sm" />
                Terminating...
              </>
            ) : (
              <>
                <FiLogOut /> Terminate Session
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
export default SessionCard;