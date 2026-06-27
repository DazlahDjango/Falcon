import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiShield,
  FiUsers,
  FiLayers,
  FiClock,
  FiFileText,
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiBriefcase,
  FiLock,
  FiBell,
  FiHelpCircle,
  FiUserCheck,
  FiKey,
  FiList,
  FiActivity,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { usePermissions } from '../../../hooks/accounts/usePermissions';
import { UserAvatar } from './UserAvatar';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';
import { USER_ROLES } from '../../../config/constants/accountsApiConstants';

const getNavigationItems = (role, isSuperAdmin) => {
  const items = [];

  items.push({
    id: 'dashboard',
    label: 'Dashboard',
    icon: FiHome,
    path: ACCOUNTS_ROUTES.DASHBOARD,
    requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff', 'read_only'],
  });

  items.push({
    id: 'users',
    label: 'Users',
    icon: FiUsers,
    path: ACCOUNTS_ROUTES.USERS,
    requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor'],
  });

  items.push({
    id: 'sessions',
    label: 'Sessions',
    icon: FiClock,
    path: ACCOUNTS_ROUTES.SESSIONS,
    requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff'],
  });

  items.push({
    id: 'mfa',
    label: 'Security',
    icon: FiShield,
    path: ACCOUNTS_ROUTES.MFA_DEVICES,
    requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff'],
    children: [
      {
        id: 'mfa-devices',
        label: 'MFA Devices',
        path: ACCOUNTS_ROUTES.MFA_DEVICES,
        requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff'],
      },
      {
        id: 'mfa-backup',
        label: 'Backup Codes',
        path: ACCOUNTS_ROUTES.MFA_BACKUP_CODES,
        requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff'],
      },
    ],
  });

  items.push({
    id: 'audit',
    label: 'Audit Logs',
    icon: FiFileText,
    path: ACCOUNTS_ROUTES.AUDIT_LOGS,
    requiredRoles: ['super_admin', 'client_admin', 'executive'],
  });

  items.push({
    id: 'profile',
    label: 'Profile',
    icon: FiUser,
    path: ACCOUNTS_ROUTES.MY_PROFILE,
    requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff', 'read_only'],
  });

  items.push({
    id: 'settings',
    label: 'Settings',
    icon: FiSettings,
    path: ACCOUNTS_ROUTES.MY_SETTINGS,
    requiredRoles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'staff'],
  });

  if (role === USER_ROLES.CLIENT_ADMIN || isSuperAdmin) {
    items.push({
      id: 'admin',
      label: 'Admin',
      icon: FiBriefcase,
      path: ACCOUNTS_ROUTES.ADMIN_DASHBOARD,
      requiredRoles: ['super_admin', 'client_admin'],
      children: [
        {
          id: 'admin-users',
          label: 'Manage Users',
          path: ACCOUNTS_ROUTES.ADMIN_USERS,
          requiredRoles: ['super_admin', 'client_admin'],
        },
        {
          id: 'admin-roles',
          label: 'Manage Roles',
          path: ACCOUNTS_ROUTES.ADMIN_ROLES,
          requiredRoles: ['super_admin', 'client_admin'],
        },
        {
          id: 'admin-permissions',
          label: 'Manage Permissions',
          path: ACCOUNTS_ROUTES.ADMIN_PERMISSIONS,
          requiredRoles: ['super_admin'],
        },
        {
          id: 'admin-tenants',
          label: 'Manage Tenants',
          path: ACCOUNTS_ROUTES.ADMIN_TENANTS,
          requiredRoles: ['super_admin'],
        },
        {
          id: 'admin-mfa',
          label: 'MFA Management',
          path: ACCOUNTS_ROUTES.ADMIN_MFA,
          requiredRoles: ['super_admin', 'client_admin'],
        },
        {
          id: 'admin-system',
          label: 'System Settings',
          path: ACCOUNTS_ROUTES.ADMIN_SYSTEM,
          requiredRoles: ['super_admin'],
        },
        {
          id: 'admin-security',
          label: 'Security',
          path: ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS,
          requiredRoles: ['super_admin', 'client_admin'],
        },
      ],
    });
  }

  return items;
};

export const AccountLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isSuperAdmin, logout, isLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role || 'staff';
  const navigationItems = getNavigationItems(role, isSuperAdmin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ACCOUNTS_ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isActive = (path) => {
    if (path === ACCOUNTS_ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isItemVisible = (item) => {
    if (item.requiredRoles) {
      if (isSuperAdmin) return true;
      return item.requiredRoles.includes(role);
    }
    return true;
  };

  const handleLogout = async () => {
    await logout();
    navigate(ACCOUNTS_ROUTES.LOGIN);
  };

  const renderNavItem = (item, depth = 0) => {
    if (!isItemVisible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);
    const hasActiveChild = hasChildren && item.children.some((child) => isActive(child.path));

    return (
      <div key={item.id} className={`nav-item depth-${depth}`}>
        {hasChildren ? (
          <>
            <button
              className={`nav-link ${isExpanded || hasActiveChild ? 'expanded' : ''}`}
              onClick={() => toggleExpand(item.id)}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              <FiChevronDown className={`nav-chevron ${isExpanded || hasActiveChild ? 'rotated' : ''}`} />
            </button>
            {(isExpanded || hasActiveChild) && (
              <div className="nav-children">
                {item.children.map((child) => renderNavItem(child, depth + 1))}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={`nav-link ${active ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </Link>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="account-layout-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarClasses = `account-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileOpen ? 'mobile-open' : ''}`;

  return (
    <div className="account-layout">
      <aside className={sidebarClasses}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FiShield className="brand-icon" />
            <span className="brand-name">Falcon PMS</span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <UserAvatar user={user} size="sm" />
            <div className="user-info">
              <span className="user-name">{user?.full_name || user?.email}</span>
              <span className="user-role">{user?.role || 'User'}</span>
            </div>
            <button className="user-menu-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <FiChevronDown className={userMenuOpen ? 'rotated' : ''} />
            </button>
          </div>
          {userMenuOpen && (
            <div className="user-menu-dropdown">
              <Link to={ACCOUNTS_ROUTES.MY_PROFILE} onClick={() => setUserMenuOpen(false)}>
                <FiUser /> Profile
              </Link>
              <Link to={ACCOUNTS_ROUTES.MY_SETTINGS} onClick={() => setUserMenuOpen(false)}>
                <FiSettings /> Settings
              </Link>
              <Link to={ACCOUNTS_ROUTES.MFA_DEVICES} onClick={() => setUserMenuOpen(false)}>
                <FiShield /> Security
              </Link>
              <hr />
              <button onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="account-main">
        <header className="main-header">
          <button className="mobile-toggle" onClick={toggleSidebar}>
            <FiMenu />
          </button>
          <div className="header-left">
            <AccountBreadcrumb />
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <FiBell />
              <span className="badge">3</span>
            </button>
            <button className="header-btn" title="Help">
              <FiHelpCircle />
            </button>
            <UserAvatar user={user} size="sm" onClick={() => navigate(ACCOUNTS_ROUTES.MY_PROFILE)} />
          </div>
        </header>

        <div className="main-content">{children || <Outlet />}</div>
      </main>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    </div>
  );
};
export default AccountLayout;