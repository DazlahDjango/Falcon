import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const routeNames = {
    '/dashboard': 'Dashboard',
    '/kpi': 'KPIs',
    '/kpi/create': 'Create KPI',
    '/kpi/edit': 'Edit KPI',
    '/reviews': 'Reviews',
    '/reviews/create': 'Create Review',
    '/missions': 'Mission Reports',
    '/team': 'Team',
    '/reporting-chain': 'Reporting Chain',
    '/invitations': 'Invitations',
    '/reports': 'Reports',
    '/profile': 'Profile',
    '/security': 'Security',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
    '/settings/tenant': 'Tenant Settings',
    '/settings/users': 'Users',
    '/settings/roles': 'Roles',
    '/audit': 'Audit Logs',
    '/admin': 'Admin',
    '/admin/users': 'Users',
    '/admin/tenants': 'Tenants',
    '/admin/system': 'System',
    '/admin/cache': 'Cache'
};
const getDynamicName = (path, params) => {
    if (path.includes('/users/') && path.includes('/edit')) {
        return 'Edit User';
    }
    if (path.includes('/users/')) {
        return 'User Details';
    }
    if (path.includes('/roles/') && path.includes('/edit')) {
        return 'Edit role';
    }
    if (path.includes('/roles/')) {
        return 'Role Details';
    }
    return null;
};
const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
        return null;
    }
    const breadcrumbs = [];
    let currentPath = '';
    for (let i = 0; i < pathnames.length; i++) {
        currentPath += `/${pathnames[i]}`;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pathnames[i]);
        if (isUuid) continue;
        let name = routeNames[currentPath];
        if (!name) {
            name = getDynamicName(currentPath, {}) || pathnames[i].charAt(0).toUpperCase() + pathnames[i].slice(1);
        }
        breadcrumbs.push({
            name, 
            path: currentPath,
            isLast: i === pathnames.length - 1
        });
    }
    if (breadcrumbs.length === 0) return null;
    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <Link to="/dashboard" className="breadcrumb-link">
                        <FiHome size={14} />
                        <span>Home</span>
                    </Link>
                </li>
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.path} className="breadcrumb-item">
                        <FiChevronRight className="breadcrumb-separator" size={14} />
                        {crumb.isLast ? (
                            <span className="breadcrumb-current">{crumb.name}</span>
                        ) : (
                            <Link to={crumb.path} className="breadcrumb-link">
                                {crumb.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};
export default Breadcrumbs;