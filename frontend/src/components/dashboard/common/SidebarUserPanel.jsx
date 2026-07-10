import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiBell, FiLogOut } from 'react-icons/fi';
import { logout } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

/**
 * Shared footer actions block for all dashboard sidebars (Profile, Notifications, Logout).
 * Replaced the old user avatar panel to align with the enterprise mockup.
 */
export const SidebarUserPanel = ({ user, isCollapsed, wsConnected }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Fetch dynamic unread count from Redux store, default to 3 if none exists (for matching UI/demo)
  const unreadCount = useSelector((state) => state.notifications?.unreadCount ?? 3);

  const handleLogoutClick = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(showAlert({ type: 'success', message: 'Logged out successfully' }));
      navigate('/login');
    } catch (error) {
      dispatch(showAlert({ type: 'error', message: error.message || 'Logout failed' }));
    }
  };

  if (!user) return null;

  return (
    <div className={`ent-sidebar-bottom-actions ${isCollapsed ? 'ent-collapsed' : ''}`}>
      {/* Profile Item */}
      <button
        type="button"
        className={`ent-bottom-action-item ${isCollapsed ? 'ent-collapsed' : ''}`}
        onClick={() => navigate('/profile')}
        title="Profile"
      >
        <div className="ent-bottom-action-item-left">
          <FiUser size={20} />
          {!isCollapsed && <span>Profile</span>}
        </div>
      </button>

      {/* Notifications Item */}
      <button
        type="button"
        className={`ent-bottom-action-item ${isCollapsed ? 'ent-collapsed' : ''}`}
        onClick={() => navigate('/notifications')}
        title="Notifications"
      >
        <div className="ent-bottom-action-item-left">
          <FiBell size={20} />
          {!isCollapsed && <span>Notifications</span>}
        </div>
        {!isCollapsed && unreadCount > 0 && (
          <span className="ent-sidebar-badge">{unreadCount}</span>
        )}
      </button>

      {/* Logout Item */}
      <button
        type="button"
        className={`ent-bottom-action-item ${isCollapsed ? 'ent-collapsed' : ''}`}
        onClick={handleLogoutClick}
        title="Logout"
        style={{ color: '#dc2626' }}
      >
        <div className="ent-bottom-action-item-left">
          <FiLogOut size={20} style={{ color: '#dc2626' }} />
          {!isCollapsed && <span>Logout</span>}
        </div>
      </button>
    </div>
  );
};

export default SidebarUserPanel;
