import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiHelpCircle, FiChevronDown } from "react-icons/fi";
import { logout } from '../../../store/accounts/slice/authSlice';
import { markAllAsRead, fetchUnreadCount } from '../../../store/accounts/slice/notificationSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { useWebSocket } from '../../../hooks/accounts/useWebSocket';
import { formatDate } from '../../../utils/accounts/formatters';

const Header = ({ user, onToggleSidebar, onLogout, sidebarOpen, sidebarCollapsed}) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { unreadCount, notifications } = useSelector((state) => state.notifications);
    const { socket, isConnected } = useWebSocket();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        dispatch(fetchUnreadCount());
    }, [dispatch]);
    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'notification') {
                    dispatch(fetchUnreadCount());
                    dispatch(showAlert({
                        type: data.level || 'info',
                        message: data.message
                    }));
                }
            };
        }
    }, [socket, dispatch]);
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };
    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
        setShowNotifications(false);
    };
    const handleViewAllNotifications = () => {
        navigate('/notifications');
        setShowNotifications(false);
    };
    return (
        <header className="app-header">
            {/* Left Section */}
            <div className="header-left">
                <button 
                    className="header-toggle-btn" 
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <FiMenu size={20} />
                </button>
                
                {/* Breadcrumb */}
                <div className="header-breadcrumb">
                    <span className="breadcrumb-item">Dashboard</span>
                </div>
            </div>
            
            {/* Center Section - Search */}
            <div className="header-center">
                <form className="search-form" onSubmit={handleSearch}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users, KPIs, reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </form>
            </div>
            
            {/* Right Section */}
            <div className="header-right">
                {/* WebSocket Status */}
                <div className={`ws-status ${isConnected ? 'connected' : 'disconnected'}`} 
                     title={isConnected ? 'Real-time connected' : 'Reconnecting...'}>
                    <div className="ws-dot"></div>
                </div>
                
                {/* Notifications */}
                <div className="header-notifications" ref={notificationsRef}>
                    <button 
                        className="notification-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                    >
                        <FiBell size={20} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </button>
                    
                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="mark-all-read">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="notification-list">
                                {notifications?.slice(0, 5).map((notif) => (
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                                        <div className={`notification-icon notification-${notif.level}`}>
                                            {getNotificationIcon(notif.level)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{formatDate(notif.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                                
                                {(!notifications || notifications.length === 0) && (
                                    <div className="notification-empty">
                                        <p>No notifications</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="notification-footer">
                                <button onClick={handleViewAllNotifications} className="view-all-btn">
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* User Menu */}
                <div className="header-user" ref={userMenuRef}>
                    <button 
                        className="user-menu-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="User menu"
                    >
                        <div className="user-avatar-small">
                            <img 
                                src={user?.avatar_url || '/static/accounts/img/default-avatar.png'} 
                                alt={user?.username}
                            />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.first_name || user?.username}</span>
                            <span className="user-role">{user?.role_display}</span>
                        </div>
                        <FiChevronDown size={16} className="user-menu-arrow" />
                    </button>
                    
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-avatar">
                                    <img 
                                        src={user?.avatar_url || '/static/accounts/img/default-avatar.png'} 
                                        alt={user?.username}
                                    />
                                </div>
                                <div className="user-details">
                                    <div className="user-name">{user?.first_name} {user?.last_name}</div>
                                    <div className="user-email">{user?.email}</div>
                                </div>
                            </div>
                            
                            <div className="user-dropdown-divider"></div>
                            
                            <div className="user-dropdown-menu">
                                <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                                    <FiUser size={16} />
                                    <span>My Profile</span>
                                </button>
                                <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                                    <FiSettings size={16} />
                                    <span>Settings</span>
                                </button>
                                <button onClick={() => { navigate('/help'); setShowUserMenu(false); }}>
                                    <FiHelpCircle size={16} />
                                    <span>Help & Support</span>
                                </button>
                            </div>
                            
                            <div className="user-dropdown-divider"></div>
                            
                            <button className="logout-btn" onClick={onLogout}>
                                <FiLogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
const getNotificationIcon = (level) => {
    const icons = {
        info: 'ℹ️',
        success: '✓',
        warning: '⚠️',
        error: '✗',
        critical: '🔥'
    };
    return icons[level] || 'ℹ️';
};
export { Header };