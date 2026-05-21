// frontend/src/components/dashboard/Sidebar/ManagerSidebar.jsx

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiBarChart2, FiUsers, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiHelpCircle, FiLogOut, FiBell,
    FiGrid, FiPieChart, FiCalendar, FiFileText, FiStar, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';

const ManagerSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        team: true,
        approvals: true,
        reports: false,
        settings: false
    });

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const navigation = {
        main: [
            { path: DASHBOARD_ROUTES.MANAGER.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
        ],
        team: [
            { path: DASHBOARD_ROUTES.MANAGER.TEAM, name: 'My Team', icon: FiUsers },
            { path: DASHBOARD_ROUTES.MANAGER.TEAM, name: 'Team Performance', icon: FiBarChart2 },
        ],
        approvals: [
            { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, name: 'Pending Approvals', icon: FiClock },
            { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, name: 'Approval History', icon: FiCheckCircle },
        ],
        reports: [
            { path: DASHBOARD_ROUTES.MANAGER.REPORTS, name: 'Team Reports', icon: FiFileText },
            { path: DASHBOARD_ROUTES.MANAGER.EXPORTS, name: 'Exports', icon: FiDownload },
        ],
        settings: [
            { path: DASHBOARD_ROUTES.MANAGER.SETTINGS, name: 'Settings', icon: FiSettings },
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
        <aside className={`sidebar manager-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Area */}
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.MANAGER.OVERVIEW} className="logo-link">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 11L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M14 13L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                    <div className="tenant-plan">Manager View</div>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Team Management', navigation.team, 'team')}
                {renderNavGroup('Approvals', navigation.approvals, 'approvals')}
                {renderNavGroup('Reports & Exports', navigation.reports, 'reports')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
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
                        <div className="user-role">Manager</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default ManagerSidebar;