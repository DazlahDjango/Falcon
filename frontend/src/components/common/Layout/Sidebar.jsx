import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiUsers, FiUserCheck, FiCalendar, FiBarChart2, FiSettings, FiShield, FiFileText, FiBell, FiLayers, FiChevronLeft,
    FiChevronRight, FiChevronDown, FiChevronUp, FiActivity, FiLock, FiDatabase, FiServer,
    FiUsers
} from 'react-icons/fi';
const Sidebar = ({ isOpen, isCollapsed, onToggle, user, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({});
    const {tenant} = useSelector((state) => state.tenant);
    // Roles navigate
    const getNavigationItem = () => {
        const baseItems = [
            { path: '/dashboard', name: 'Dashboard', icon: FiHome, roles: ['all'] },
            { path: '/kpi', name: 'KPIs', icon: FiBarChart2, roles: ['all'] },
            { path: '/reviews', name: 'Reviews', icon: FiFileText, roles: ['all'] },
        ];
        const teamItems = [
            { path: '/team', name: 'Team', icon: FiUsers, roles: ['super_admin', 'client_admin', 'executive', 'supervisor'] },
            { path: '/users', name: 'Users', icon: FiUserCheck, roles: ['super_admin', 'client_admin'] },
        ];
        const reportingItems = [
            { path: '/reports', name: 'Reports', icon: FiBarChart2, roles: ['super_admin', 'client_admin', 'executive'] },
            { path: '/audit', name: 'Audit Logs', icon: FiActivity, roles: ['super_admin', 'client_admin', 'executive'] },
        ];
        const settingsItems = [
            { path: '/settings', name: 'Settings', icon: FiSettings, roles: ['super_admin', 'client_admin'] },
            { path: '/security', name: 'Security', icon: FiShield, roles: ['all'] },
            { path: '/notifications', name: 'Notifications', icon: FiBell, roles: ['all'] },
        ];
        const adminItems = [
            { path: '/admin/users', name: 'Admin Users', icon: FiUsers, roles: ['super_admin'] },
            { path: '/admin/tenants', name: 'Tenants', icon: FiLayers, roles: ['super_admin'] },
            { path: '/admin/system', name: 'System', icon: FiServer, roles: ['super_admin'] },
            { path: '/admin/cache', name: 'Cache', icon: FiDatabase, roles: ['super_admin'] },
        ];
        return {
            main: baseItems,
            team: teamItems,
            reporting: reportingItems,
            settings: settingsItems,
            admin: adminItems
        };
    };
    const navigation = getNavigationItem();
    const hasAccess = (roles) => {
        if (roles.includes('all')) return true;
        if (user?.role && roles.includes(user.role)) return true;
        return false;
    };
    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };
    const renderNavGroup = (title, items, groupkey) => {
        const filteredItems = items.filter(item => hasAccess(item.roles));
        if (filteredItems.length === 0) return null;
        const isExpanded = expandedMenus[groupkey];
        const Icon = isExpanded ? FiChevronUp : FiChevronDown;
        return (
            <div className="nav-group">
                <button className="nav-group-header" onClick={() => toggleMenu(groupkey)} disabled={isCollapsed}>
                    <span className="nav-group-title">{title}</span>
                    {!isCollapsed && <Icon size={16} />}
                </button>
                {(isExpanded || isCollapsed) && (
                    <ul className="nav-group-items">
                        {filteredItems.map((item) => (
                            <li key={item.path}>
                                <NavLink 
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Area */}
            <div className="sidebar-logo">
                <NavLink to="/dashboard" className="logo-link">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    {!isCollapsed && <span className="logo-text">Falcon PMS</span>}
                </NavLink>
                {/* Collapse Toggle Button */}
                <button className="sidebar-toggle" onClick={onToggle}>
                    {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                </button>
            </div>
            {/* Tenant Info */}
            {!isCollapsed && tenant && (
                <div className="sidebar-tenant">
                    <div className="tenant-name">{tenant.name}</div>
                    <div className="tenant-plan">{tenant.subscription_plan}</div>
                </div>
            )}
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Team', navigation.team, 'team')}
                {renderNavGroup('Reporting', navigation.reporting, 'reporting')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
                {user?.role === 'super_admin' && renderNavGroup('Admin', navigation.admin, 'admin')}
            </nav>
            {/* User Info at Bottom */}
            {!isCollapsed && user && (
                <div className="sidebar-user">
                    <div className="user-avatar-small">
                        <img 
                            src={user.avatar_url || '/static/accounts/img/default-avatar.png'} 
                            alt={user.username}
                        />
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.first_name || user.username}</div>
                        <div className="user-role">{user.role_display}</div>
                    </div>
                </div>
            )}
        </aside>
    );
};
export { Sidebar };