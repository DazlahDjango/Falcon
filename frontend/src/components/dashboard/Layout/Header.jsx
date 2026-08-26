import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiHelpCircle, FiChevronDown, FiGrid, FiRadio, FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle, FiAlertOctagon, FiEye, FiRotateCcw } from "react-icons/fi";
import { markAllAsRead, fetchUnreadCount } from '../../../store/accounts/slice/notificationSlice';
import { formatDate } from '../../../utils/accounts/formatters';
import { getDefaultRouteByRole } from '../../../config/constants/dashboardRouteConstants';
import { useDashboardProfileContext } from '../../../contexts/dashboard/DashboardProfileContext';

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

    const { isSuperAdmin, previewRole, setPreviewRole, resetPreview } = useDashboardProfileContext();

    // ✅ Use useSelector for notifications, auth user, and profiles
    const { unreadCount, notifications } = useSelector((state) => state.notifications || { unreadCount: 0, notifications: [] });
    const authUser = useSelector((state) => state.auth?.user);
    const currentProfile = useSelector((state) => state.profiles?.currentProfile);

    const avatarUrl = 
        user?.avatarUrl || 
        user?.avatar_url || 
        user?.avatar || 
        currentProfile?.avatar || 
        authUser?.avatar || 
        authUser?.avatar_url;

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

    // ✅ User Active status & WebSocket status
    const isUserActive = user?.is_active ?? authUser?.is_active ?? true;

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
                {isSuperAdmin && (
                    <div className="ent-role-preview-switcher flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300">
                        <FiEye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="hidden sm:inline text-[11px] text-amber-800 dark:text-amber-200 font-bold">Preview As:</span>
                        <select
                            value={previewRole || ''}
                            onChange={(e) => {
                                const targetRole = e.target.value || null;
                                setPreviewRole(targetRole);
                                if (targetRole) {
                                    navigate(getDefaultRouteByRole(targetRole));
                                } else {
                                    navigate('/dashboard/super-admin/overview');
                                }
                            }}
                            className="bg-transparent border-0 text-xs font-bold text-amber-900 dark:text-amber-100 focus:ring-0 cursor-pointer p-0 pr-1"
                        >
                            <option value="" className="text-slate-800">Super Admin (Live)</option>
                            <option value="client_admin" className="text-slate-800">Client Admin</option>
                            <option value="executive" className="text-slate-800">Executive</option>
                            <option value="supervisor" className="text-slate-800">Supervisor / Manager</option>
                            <option value="staff" className="text-slate-800">Staff</option>
                            <option value="read_only" className="text-slate-800">Read Only</option>
                            <option value="dashboard_champion" className="text-slate-800">Dashboard Champion</option>
                        </select>
                        {previewRole && (
                            <button
                                onClick={() => {
                                    resetPreview();
                                    navigate('/dashboard/super-admin/overview');
                                }}
                                className="p-1 hover:bg-amber-500/20 rounded text-amber-800 dark:text-amber-200 transition"
                                title="Reset to Super Admin view"
                            >
                                <FiRotateCcw className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
                <span 
                  className={`ent-header-user-status ${isUserActive ? 'status-active' : 'status-inactive'}`}
                  title={isUserActive ? 'User account active' : 'User account inactive'}
                >
                  <span className={`status-dot ${isUserActive ? 'dot-active' : 'dot-inactive'}`} />
                  {isUserActive ? 'Active' : 'Inactive'}
                </span>
                <span
                  className={`ent-header-live ${wsConnected ? 'ent-live-on' : ''}`}
                  title={wsConnected ? 'WebSocket connected' : 'WebSocket disconnected'}
                >
                  <FiRadio size={14} />
                  {wsConnected ? 'Connected' : 'Disconnected'}
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
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt={user?.firstName || user?.first_name || user?.username || 'User'}
                                />
                            ) : (
                                <div className="ent-avatar-placeholder">
                                    {(user?.firstName || user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="ent-user-info">
                            <span className="ent-user-name">{user?.firstName || user?.first_name || user?.username}</span>
                        </div>
                        <FiChevronDown size={16} className="ent-user-menu-arrow" />
                    </button>
                    
                    {showUserMenu && (
                        <div className="ent-user-dropdown">
                            <div className="ent-user-dropdown-header">
                                <div className="ent-user-avatar">
                                    {avatarUrl ? (
                                        <img 
                                            src={avatarUrl} 
                                            alt={user?.firstName || user?.first_name || user?.username || 'User'}
                                        />
                                    ) : (
                                        <div className="ent-avatar-placeholder ent-large">
                                            {(user?.firstName || user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
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