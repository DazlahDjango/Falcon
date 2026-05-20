import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiBarChart2, FiUsers, FiShield, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiDatabase, FiActivity, FiServer,
    FiGrid, FiDollarSign, FiFileText, FiBell, FiClock,
    FiTrendingUp, FiLock, FiHardDrive, FiRefreshCw
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';

const SuperAdminSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        platform: true,
        management: true,
        billing: false,
        system: false,
        support: false
    });

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const navigation = {
        main: [
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW, name: 'Platform Overview', icon: FiHome, end: true },
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.PLATFORM_METRICS, name: 'Metrics', icon: FiBarChart2 },
        ],
        platform: [
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.TENANTS, name: 'All Tenants', icon: FiServer },
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, name: 'Subscriptions', icon: FiDollarSign },
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.BILLING, name: 'Billing', icon: FiGrid },
        ],
        management: [
            { path: '/tenants', name: 'Tenant Management', icon: FiDatabase },
            { path: '/tenants/connections', name: 'Connections', icon: FiActivity },
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.AUDIT_LOGS, name: 'Audit Logs', icon: FiFileText },
        ],
        billing: [
            { path: '/billing/plans', name: 'Plans', icon: FiDollarSign },
            { path: '/billing/transactions', name: 'Transactions', icon: FiClock },
            { path: '/billing/reports', name: 'Billing Reports', icon: FiTrendingUp },
        ],
        system: [
            { path: DASHBOARD_ROUTES.SUPER_ADMIN.SYSTEM_HEALTH, name: 'System Health', icon: FiActivity },
            { path: '/config/backups', name: 'Backups', icon: FiHardDrive },
            { path: '/config/maintenance', name: 'Maintenance', icon: FiRefreshCw },
            { path: '/config/encryption', name: 'Encryption', icon: FiLock },
            { path: '/config/settings', name: 'System Settings', icon: FiSettings },
        ],
        support: [
            { path: '/support/tickets', name: 'Support Tickets', icon: FiBell },
            { path: '/support/audit', name: 'Audit Trails', icon: FiShield },
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
        <aside className={`sidebar superadmin-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Area */}
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW} className="logo-link">
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
            
            {/* Platform Info */}
            {!isCollapsed && (
                <div className="sidebar-tenant">
                    <div className="tenant-name">Platform Admin</div>
                    <div className="tenant-plan">Super Admin</div>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Platform', navigation.platform, 'platform')}
                {renderNavGroup('Management', navigation.management, 'management')}
                {renderNavGroup('Billing', navigation.billing, 'billing')}
                {renderNavGroup('System', navigation.system, 'system')}
                {renderNavGroup('Support', navigation.support, 'support')}
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
                        <div className="user-role">Super Admin</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default SuperAdminSidebar;