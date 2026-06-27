import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

const routeLabels = {
  [ACCOUNTS_ROUTES.DASHBOARD]: 'Dashboard',
  [ACCOUNTS_ROUTES.USERS]: 'Users',
  [ACCOUNTS_ROUTES.PROFILES]: 'Profiles',
  [ACCOUNTS_ROUTES.ROLES]: 'Roles',
  [ACCOUNTS_ROUTES.PERMISSIONS]: 'Permissions',
  [ACCOUNTS_ROUTES.SESSIONS]: 'Sessions',
  [ACCOUNTS_ROUTES.AUDIT_LOGS]: 'Audit Logs',
  [ACCOUNTS_ROUTES.MFA_DEVICES]: 'MFA Devices',
  [ACCOUNTS_ROUTES.MFA_BACKUP_CODES]: 'Backup Codes',
  [ACCOUNTS_ROUTES.MFA_SETUP]: 'MFA Setup',
  [ACCOUNTS_ROUTES.MFA_VERIFY]: 'MFA Verification',
  [ACCOUNTS_ROUTES.MY_PROFILE]: 'My Profile',
  [ACCOUNTS_ROUTES.MY_SETTINGS]: 'Settings',
  [ACCOUNTS_ROUTES.ADMIN_DASHBOARD]: 'Admin',
  [ACCOUNTS_ROUTES.ADMIN_USERS]: 'Manage Users',
  [ACCOUNTS_ROUTES.ADMIN_ROLES]: 'Manage Roles',
  [ACCOUNTS_ROUTES.ADMIN_PERMISSIONS]: 'Manage Permissions',
  [ACCOUNTS_ROUTES.ADMIN_TENANTS]: 'Manage Tenants',
  [ACCOUNTS_ROUTES.ADMIN_MFA]: 'MFA Management',
  [ACCOUNTS_ROUTES.ADMIN_SYSTEM]: 'System Settings',
  [ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS]: 'Login Attempts',
  [ACCOUNTS_ROUTES.SECURITY_LOCKOUT_SUMMARY]: 'Lockout Summary',
  [ACCOUNTS_ROUTES.SYSTEM_SETTINGS]: 'System Settings',
  [ACCOUNTS_ROUTES.TENANT_SETTINGS]: 'Tenant Settings',
  [ACCOUNTS_ROUTES.AUDIT_COMPLIANCE]: 'Compliance Report',
  [ACCOUNTS_ROUTES.AUDIT_SECURITY_EVENTS]: 'Security Events',
  [ACCOUNTS_ROUTES.AUDIT_ANOMALY]: 'Anomaly Detection',
};

const getBreadcrumbItems = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const items = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    items.push({ path: currentPath, label });
  }

  return items;
};

export const AccountBreadcrumb = () => {
  const location = useLocation();
  const items = getBreadcrumbItems(location.pathname);

  if (items.length === 0) {
    return (
      <div className="account-breadcrumb">
        <Link to={ACCOUNTS_ROUTES.DASHBOARD} className="breadcrumb-home">
          <FiHome />
        </Link>
      </div>
    );
  }

  return (
    <nav className="account-breadcrumb" aria-label="Breadcrumb">
      <Link to={ACCOUNTS_ROUTES.DASHBOARD} className="breadcrumb-home">
        <FiHome />
      </Link>
      <FiChevronRight className="breadcrumb-separator" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.path}>
            {isLast ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
            {!isLast && <FiChevronRight className="breadcrumb-separator" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
export default AccountBreadcrumb;