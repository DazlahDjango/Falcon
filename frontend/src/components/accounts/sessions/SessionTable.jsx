import React, { useState } from 'react';
import {
  FiMoreVertical,
  FiLogOut,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiAlertCircle,
} from 'react-icons/fi';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { UserAvatar } from '../common/UserAvatar';

export const SessionTable = ({ sessions, isLoading, onRefresh }) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { terminateSession } = useSessions();
  const [activeMenu, setActiveMenu] = useState(null);
  const [terminatingId, setTerminatingId] = useState(null);

  const handleMenuToggle = (sessionId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === sessionId ? null : sessionId);
  };

  const handleTerminate = async (sessionId) => {
    setTerminatingId(sessionId);
    try {
      await terminateSession(sessionId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to terminate session:', err);
    } finally {
      setTerminatingId(null);
      setActiveMenu(null);
    }
  };

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

  const canTerminate = (session) => {
    if (isSuperAdmin) return true;
    if (isAdmin) return true;
    return !session.is_current;
  };

  if (isLoading) {
    return (
      <div className="session-table-loading">
        <div className="spinner-sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="session-table-container">
      <table className="session-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Device</th>
            <th>IP Address</th>
            <th>Browser / OS</th>
            <th>Login Time</th>
            <th>Duration</th>
            <th>Status</th>
            <th className="actions-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              className={`session-table-row ${session.is_current ? 'current' : ''}`}
            >
              <td>
                <div className="user-cell">
                  <UserAvatar user={session.user} size="sm" />
                  <div className="user-cell-info">
                    <span className="user-cell-name">
                      {session.user?.full_name || session.user?.email || 'Unknown'}
                    </span>
                    <span className="user-cell-email">{session.user?.email}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="device-cell">
                  {getDeviceIcon(session.device_type)}
                  <span>{session.device_type || 'Unknown'}</span>
                </div>
              </td>
              <td>
                <code className="ip-address">{session.ip_address || '-'}</code>
              </td>
              <td>
                <div className="browser-cell">
                  <span className="browser">{session.browser || '-'}</span>
                  <span className="os">{session.os || '-'}</span>
                </div>
              </td>
              <td>{formatDate(session.login_time)}</td>
              <td>{session.duration || '-'}</td>
              <td>{getStatusBadge(session.status)}</td>
              <td className="actions-cell">
                <div className="action-menu">
                  {session.status === 'active' && canTerminate(session) && (
                    <button
                      className="terminate-btn"
                      onClick={() => handleTerminate(session.id)}
                      disabled={terminatingId === session.id}
                      title="Terminate session"
                    >
                      {terminatingId === session.id ? (
                        <span className="spinner-sm" />
                      ) : (
                        <FiLogOut />
                      )}
                    </button>
                  )}
                  {session.is_current && (
                    <span className="current-badge">Current</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default SessionTable;