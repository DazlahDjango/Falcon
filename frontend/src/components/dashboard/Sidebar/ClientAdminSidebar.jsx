import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiBarChart2, FiUsers, FiCheckCircle, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiShield, FiDatabase, FiActivity,
    FiUserCheck, FiClock, FiTrendingUp, FiFileText, FiGrid,
    FiServer, FiLock, FiBell, FiCalendar
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';

const ClientAdminSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        oversight: true,
        management: true,
        compliance: true,
        configuration: false
    });

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const navigation = {
        main: [
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.TENANT, name: 'Tenant Overview', icon: FiServer },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.KPI_BREAKDOWN, name: 'KPI Breakdown', icon: FiBarChart2 },
        ],
        oversight: [
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.COMPLIANCE, name: 'Compliance', icon: FiCheckCircle },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.APPROVALS, name: 'Pending Approvals', icon: FiClock },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.MISSING_DATA, name: 'Missing Data', icon: FiAlertCircle },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USER_ACTIVITY, name: 'User Activity', icon: FiActivity },
        ],
        management: [
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.USERS, name: 'Users', icon: FiUsers },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.ROLES, name: 'Roles & Permissions', icon: FiShield },
        ],
        compliance: [
            { path: '/reports/compliance', name: 'Compliance Reports', icon: FiFileText },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.REPORTS, name: 'Analytics', icon: FiTrendingUp },
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.EXPORTS, name: 'Exports', icon: FiDownload },
        ],
        configuration: [
            { path: DASHBOARD_ROUTES.CLIENT_ADMIN.SETTINGS, name: 'Settings', icon: FiSettings },
            { path: '/config/backups', name: 'Backups', icon: FiDatabase },
            { path: '/config/security', name: 'Security', icon: FiLock },
        ]
    };

    const renderNavGroup = (title, items, groupKey) => {
        if (!items || items.length === 0) return null;
        
        const isExpanded = expandedMenus[groupKey];
        const Icon = isExpanded ? FiChevronUp : FiChevronDown;
        
        return (
            <div className="nav-group" key={groupKey}>
                <button 
                    className="nav-group-header" 
                    onClick={() => toggleMenu(groupKey)} 
                    disabled={isCollapsed}
                >
                    <span className="nav-group-title">{title}</span>
                    {!isCollapsed && <Icon size={16} />}
                </button>
                {(isExpanded || isCollapsed) && (
                    <ul className="nav-group-items">
                        {items.map((item) => (
                            <li key={item.path}>
                                <NavLink 
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    end={item.end}
                                >
                                    <item.icon size={20} />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <aside className={`sidebar client-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Area */}
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW} className="logo-link">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    {!isCollapsed && <span className="logo-text">Falcon PMS</span>}
                </NavLink>
                <button className="sidebar-toggle" onClick={onToggle}>
                    {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                </button>
            </div>
            
            {/* Tenant Info */}
            {!isCollapsed && currentTenant && (
                <div className="sidebar-tenant">
                    <div className="tenant-name">{currentTenant.name}</div>
                    <div className="tenant-plan">Admin Access</div>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Oversight', navigation.oversight, 'oversight')}
                {renderNavGroup('Management', navigation.management, 'management')}
                {renderNavGroup('Reports & Compliance', navigation.compliance, 'compliance')}
                {renderNavGroup('Configuration', navigation.configuration, 'configuration')}
            </nav>
            
            {/* User Info at Bottom */}
            {!isCollapsed && user && (
                <div className="sidebar-user">
                    <div className="user-avatar-small">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.first_name || user.username}</div>
                        <div className="user-role">Client Admin</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default ClientAdminSidebar;