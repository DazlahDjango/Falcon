// frontend/src/components/dashboard/Sidebar/ReadOnlySidebar.jsx

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiBarChart2, FiUsers, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiHelpCircle, FiLogOut, FiBell,
    FiGrid, FiPieChart, FiCalendar, FiFileText, FiStar, FiEye,
    FiActivity, FiBriefcase
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

const ReadOnlySidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath, wsConnected }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        views: true,
        analytics: true,
        exports: false
    });

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const navigation = {
        main: [
            { path: DASHBOARD_ROUTES.READ_ONLY.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
        ],
        views: [
            { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'Executive View', icon: FiBriefcase },
            { path: DASHBOARD_ROUTES.READ_ONLY.MANAGER_VIEW, name: 'Manager View', icon: FiUsers },
            { path: DASHBOARD_ROUTES.READ_ONLY.STAFF_VIEW, name: 'Staff View', icon: FiUser },
        ],
        analytics: [
            { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'KPIs & Metrics', icon: FiActivity },
            { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'Trends', icon: FiTrendingUp },
            { path: DASHBOARD_ROUTES.READ_ONLY.EXECUTIVE_VIEW, name: 'Comparisons', icon: FiPieChart },
        ],
        exports: [
            { path: DASHBOARD_ROUTES.READ_ONLY.EXPORTS, name: 'Export Data', icon: FiDownload },
            { path: DASHBOARD_ROUTES.READ_ONLY.EXPORTS, name: 'Reports', icon: FiFileText },
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
        <aside className={`sidebar read-only-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Area */}
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.READ_ONLY.OVERVIEW} className="logo-link">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 9L12 12L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="9" r="1" fill="currentColor"/>
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
                    <div className="tenant-plan">Read-Only Access</div>
                </div>
            )}
            
            {/* Read-Only Badge */}
            {!isCollapsed && (
                <div className="readonly-badge">
                    <FiEye size={14} />
                    <span>Read-Only Mode</span>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Dashboard Views', navigation.views, 'views')}
                {renderNavGroup('Analytics', navigation.analytics, 'analytics')}
                {renderNavGroup('Exports', navigation.exports, 'exports')}
            </nav>
            
            <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
        </aside>
    );
};

export default ReadOnlySidebar;