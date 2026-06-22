import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSyncExternalStore } from 'react';
import { FiMenu, FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiHelpCircle, FiChevronDown, FiGrid, FiRadio, FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle, FiAlertOctagon } from "react-icons/fi";
import { markAllAsRead, fetchUnreadCount } from '../../../store/accounts/slice/notificationSlice';
import { formatDate } from '../../../utils/accounts/formatters';
import { getDefaultRouteByRole } from '../../../config/constants/dashboardRouteConstants';
import store from '../../../store';

const Header = ({ user, dashboardRole, onToggleSidebar, onLogout, sidebarOpen, sidebarCollapsed, wsConnected }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const notificationsState = useSyncExternalStore(
        (listener) => store.subscribe(listener),
        () => store.getState().notifications || { unreadCount: 0, notifications: [] },
    );
    const { unreadCount, notifications } = notificationsState;

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
        store.dispatch(fetchUnreadCount());
    }, []);

    useEffect(() => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);
        const breadcrumbItems = [];
        
        if (segments[0] === 'dashboard') {
            breadcrumbItems.push({ name: 'Dashboard', path: getDefaultRouteByRole(dashboardRole || user?.role) });
            if (segments[1]) {
                const labels = {
                    'executive': 'Executive',
                    'client-admin': 'Client Admin',
                    'super-admin': 'Super Admin',
                    'overview': 'Overview',
                    'departments': 'Departments',
                    'team': 'Team',
                    'trends': 'Trends',
                    'comparisons': 'Comparisons',
                    'alerts': 'Alerts',
                    'reports': 'Reports',
                    'exports': 'Exports',
                    'settings': 'Settings',
                    'tenants': 'Tenants',
                    'system-health': 'System Health',
                    'billing': 'Billing'
                };
                breadcrumbItems.push({ name: labels[segments[1]] || segments[1], path: path });
            }
        } else if (segments[0] === 'kpi') {
            breadcrumbItems.push({ name: 'KPI', path: '/kpi/dashboard' });
            if (segments[1]) {
                const labels = {
                    'dashboard': 'Dashboard',
                    'management': 'Management',
                    'targets': 'Targets',
                    'actuals': 'Performance',
                    'reports': 'Reports'
                };
                breadcrumbItems.push({ name: labels[segments[1]] || segments[1], path: path });
            }
        } else if (segments[0] === 'reviews') {
            breadcrumbItems.push({ name: 'Reviews', path: '/reviews/dashboard' });
            if (segments[1]) {
                const labels = {
                    'dashboard': 'Dashboard',
                    'cycles': 'Cycles',
                    'self-assessment': 'Self Assessment',
                    'review-queue': 'Review Queue',
                    'final-ratings': 'Final Ratings',
                    'pips': 'Performance Plans',
                    'feedback': '360 Feedback',
                    'calibration': 'Calibration',
                    'reports': 'Reports',
                    'settings': 'Settings'
                };
                breadcrumbItems.push({ name: labels[segments[1]] || segments[1], path: path });
            }
        } else if (segments[0] === 'structure') {
            breadcrumbItems.push({ name: 'Structure', path: '/structure/dashboard' });
            if (segments[1]) {
                const labels = {
                    'dashboard': 'Dashboard',
                    'departments': 'Departments',
                    'teams': 'Teams',
                    'positions': 'Positions',
                    'employments': 'Employments',
                    'reporting-lines': 'Reporting Lines',
                    'cost-centers': 'Cost Centers',
                    'locations': 'Locations',
                    'org-chart': 'Organization Chart'
                };
                breadcrumbItems.push({ name: labels[segments[1]] || segments[1], path: path });
            }
        } else if (segments[0] === 'config') {
            breadcrumbItems.push({ name: 'Config', path: '/config/dashboard' });
            if (segments[1]) {
                const labels = {
                    'dashboard': 'Dashboard',
                    'backups': 'Backups',
                    'maintenance': 'Maintenance',
                    'disaster-recovery': 'Disaster Recovery',
                    'health': 'Health Check',
                    'schedules': 'Schedules',
                    'quotas': 'Quotas',
                    'encryption': 'Encryption',
                    'audit-logs': 'Audit Logs',
                    'settings': 'Settings'
                };
                breadcrumbItems.push({ name: labels[segments[1]] || segments[1], path: path });
            }
        } else if (segments[0] === 'billing') {
            breadcrumbItems.push({ name: 'Billing', path: '/billing/portal' });
            if (segments[1]) {
                const labels = {
                    'portal': 'Portal',
                    'plans': 'Plans',
                    'subscriptions': 'Subscriptions',
                    'invoices': 'Invoices',
                    'transactions': 'Transactions',
                    'payment-methods': 'Payment Methods',
                    'settings': 'Settings'
                };
                breadcrumbItems.push({ name: labels[segments[1]] || segments[1], path: path });
            }
        } else if (segments[0] === 'tenants') {
            breadcrumbItems.push({ name: 'Tenants', path: '/tenants' });
            if (segments[1] && segments[1] !== 'create') {
                breadcrumbItems.push({ name: 'Tenant Details', path: path });
            } else if (segments[1] === 'create') {
                breadcrumbItems.push({ name: 'Create Tenant', path: path });
            }
        }
        
        setBreadcrumbs(breadcrumbItems);
    }, [location.pathname, user?.role]);

    const statusText = user?.is_active != null ? (user.is_active ? 'Active' : 'Inactive') : (wsConnected ? 'Live' : 'Offline');
    const statusTitle = user?.is_active != null ? (user.is_active ? 'User active' : 'User inactive') : (wsConnected ? 'Dashboard live' : 'Dashboard offline');
    const statusClassNames = `dashboard-header-live ${(user?.is_active != null ? user.is_active : wsConnected) ? 'dashboard-header-live--on' : ''}`.trim();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleMarkAllRead = () => {
        store.dispatch(markAllAsRead());
        setShowNotifications(false);
    };

    const handleViewAllNotifications = () => {
        navigate('/notifications');
        setShowNotifications(false);
    };

    const handleDashboardClick = () => {
        navigate(getDefaultRouteByRole(dashboardRole || user?.role));
    };

    const getNotificationIcon = (level) => {
        switch (level) {
            case 'info':
                return <FiInfo size={16} />;
            case 'success':
                return <FiCheckCircle size={16} />;
            case 'warning':
                return <FiAlertTriangle size={16} />;
            case 'error':
                return <FiXCircle size={16} />;
            case 'critical':
                return <FiAlertOctagon size={16} />;
            default:
                return <FiInfo size={16} />;
        }
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <button 
                    className="header-toggle-btn" 
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <FiMenu size={20} />
                </button>
                
                <div className="header-breadcrumb">
                    {breadcrumbs.map((item, index) => (
                        <React.Fragment key={item.path}>
                            {index > 0 && <span className="breadcrumb-separator">/</span>}
                            <button 
                                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
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
            
            <div className="header-right">
                <span
                  className={statusClassNames}
                  title={statusTitle}
                >
                  <FiRadio size={14} />
                  {statusText}
                </span>
                <button 
                    className="dashboard-quick-btn"
                    onClick={handleDashboardClick}
                    title="Dashboard"
                >
                    <FiGrid size={18} />
                </button>
                
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
                
                <div className="header-user" ref={userMenuRef}>
                    <button 
                        className="user-menu-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="User menu"
                    >
                        <div className="user-avatar-small">
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url} 
                                    alt={user.username}
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.first_name || user?.username}</span>
                        </div>
                        <FiChevronDown size={16} className="user-menu-arrow" />
                    </button>
                    
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-avatar">
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.username}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder large">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
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

export { Header };
export default Header;