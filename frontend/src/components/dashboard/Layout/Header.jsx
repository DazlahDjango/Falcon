import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiHelpCircle, FiChevronDown, FiGrid, FiRadio, FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle, FiAlertOctagon } from "react-icons/fi";
import { markAllAsRead, fetchUnreadCount } from '../../../store/accounts/slice/notificationSlice';
import { formatDate } from '../../../utils/accounts/formatters';
import { getDefaultRouteByRole } from '../../../config/constants/dashboardRouteConstants';

const Header = ({ user, dashboardRole, onToggleSidebar, onLogout, sidebarOpen, sidebarCollapsed, wsConnected }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // ✅ Use useSelector instead of useSyncExternalStore
    const { unreadCount, notifications } = useSelector((state) => state.notifications || { unreadCount: 0, notifications: [] });

    // ✅ Fetch unread count only once on mount
    useEffect(() => {
        dispatch(fetchUnreadCount());
    }, [dispatch]);

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

    // ✅ Memoize breadcrumb generation to prevent unnecessary recalculations
    const generateBreadcrumbs = useCallback(() => {
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
        
        // Remove duplicate breadcrumbs based on path
        return breadcrumbItems.filter(
            (item, index, self) => index === self.findIndex((t) => t.path === item.path)
        );
    }, [location.pathname, user?.role, dashboardRole]);

    // ✅ Update breadcrumbs only when they change
    useEffect(() => {
        const newBreadcrumbs = generateBreadcrumbs();
        // ✅ Only update if changed to prevent infinite loop
        setBreadcrumbs((prev) => {
            if (prev.length !== newBreadcrumbs.length) return newBreadcrumbs;
            if (prev.some((item, i) => item.path !== newBreadcrumbs[i]?.path)) return newBreadcrumbs;
            return prev;
        });
    }, [generateBreadcrumbs]);

    // ✅ Memoize status text
    const statusText = useMemo(() => {
        return user?.is_active != null ? (user.is_active ? 'Active' : 'Inactive') : (wsConnected ? 'Live' : 'Offline');
    }, [user?.is_active, wsConnected]);

    const statusTitle = useMemo(() => {
        return user?.is_active != null ? (user.is_active ? 'User active' : 'User inactive') : (wsConnected ? 'Dashboard live' : 'Dashboard offline');
    }, [user?.is_active, wsConnected]);

    const statusClassNames = useMemo(() => {
        const isOn = user?.is_active != null ? user.is_active : wsConnected;
        return `ent-header-live ${isOn ? 'ent-live-on' : ''}`.trim();
    }, [user?.is_active, wsConnected]);

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
        <header className="ent-app-header">
            <div className="ent-header-left">
                <button 
                    className="ent-header-toggle-btn" 
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <FiMenu size={20} />
                </button>
                
                <div className="ent-header-breadcrumb">
                    {breadcrumbs.map((item, index) => (
                        <React.Fragment key={`${item.path}-${index}`}>
                            {index > 0 && <span className="ent-breadcrumb-separator">/</span>}
                            <button 
                                className={`ent-breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <div className="ent-header-center">
                <form className="ent-search-form" onSubmit={handleSearch}>
                    <FiSearch className="ent-search-icon" />
                    <input
                        type="text"
                        placeholder="Search users, KPIs, reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ent-search-input"
                    />
                </form>
            </div>
            
            <div className="ent-header-right">
                <span
                  className={statusClassNames}
                  title={statusTitle}
                >
                  <FiRadio size={14} />
                  {statusText}
                </span>
                <button 
                    className="ent-quick-btn"
                    onClick={handleDashboardClick}
                    title="Dashboard"
                >
                    <FiGrid size={18} />
                </button>
                
                <div className="ent-header-notifications" ref={notificationsRef}>
                    <button 
                        className="ent-notification-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                    >
                        <FiBell size={20} />
                        {unreadCount > 0 && (
                            <span className="ent-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </button>
                    
                    {showNotifications && (
                        <div className="ent-notification-dropdown">
                            <div className="ent-notification-header">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="ent-mark-all-read">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="ent-notification-list">
                                {notifications?.slice(0, 5).map((notif) => (
                                    <div key={notif.id} className={`ent-notification-item ${!notif.read ? 'unread' : ''}`}>
                                        <div className={`ent-notification-icon ent-notification-${notif.level}`}>
                                            {getNotificationIcon(notif.level)}
                                        </div>
                                        <div className="ent-notification-content">
                                            <div className="ent-notification-title">{notif.title}</div>
                                            <div className="ent-notification-message">{notif.message}</div>
                                            <div className="ent-notification-time">{formatDate(notif.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                                
                                {(!notifications || notifications.length === 0) && (
                                    <div className="ent-notification-empty">
                                        <p>No notifications</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="ent-notification-footer">
                                <button onClick={handleViewAllNotifications} className="ent-view-all-btn">
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="ent-header-user" ref={userMenuRef}>
                    <button 
                        className="ent-user-menu-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="User menu"
                    >
                        <div className="ent-user-avatar-small">
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url} 
                                    alt={user.username}
                                />
                            ) : (
                                <div className="ent-avatar-placeholder">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="ent-user-info">
                            <span className="ent-user-name">{user?.first_name || user?.username}</span>
                        </div>
                        <FiChevronDown size={16} className="ent-user-menu-arrow" />
                    </button>
                    
                    {showUserMenu && (
                        <div className="ent-user-dropdown">
                            <div className="ent-user-dropdown-header">
                                <div className="ent-user-avatar">
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.username}
                                        />
                                    ) : (
                                        <div className="ent-avatar-placeholder ent-large">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="ent-user-details">
                                    <div className="ent-user-name">{user?.first_name} {user?.last_name}</div>
                                    <div className="ent-user-email">{user?.email}</div>
                                </div>
                            </div>
                            
                            <div className="ent-user-dropdown-divider"></div>
                            
                            <div className="ent-user-dropdown-menu">
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
                            
                            <div className="ent-user-dropdown-divider"></div>
                            
                            <button className="ent-logout-btn" onClick={onLogout}>
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