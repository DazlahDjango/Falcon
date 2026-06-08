import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FiHome, FiBarChart2, FiUsers, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiBell, FiGrid, FiFileText, FiTarget,
    FiCheckCircle, FiClock, FiUserCheck
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

const ManagerSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath, wsConnected }) => {
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
            { path: DASHBOARD_ROUTES.MANAGER.TEAM, name: 'Team Dashboard', icon: FiUsers },
        ],
        team: [
            { path: DASHBOARD_ROUTES.MANAGER.TEAM, name: 'My Team', icon: FiUserCheck },
            { path: DASHBOARD_ROUTES.MANAGER.TEAM_PERFORMANCE, name: 'Team Performance', icon: FiBarChart2 },
            { path: KPI_ROUTES.SCORE_TEAM_SCORES, name: 'Team Scores', icon: FiTrendingUp },
            { path: KPI_ROUTES.USER_TARGETS(':userId'), name: 'Team Targets', icon: FiTarget },
        ],
        approvals: [
            { path: DASHBOARD_ROUTES.MANAGER.APPROVALS, name: 'Pending Approvals', icon: FiClock },
            { path: KPI_ROUTES.VALIDATIONS_PENDING, name: 'Pending Validations', icon: FiCheckCircle },
            { path: KPI_ROUTES.VALIDATIONS_HISTORY, name: 'Validation History', icon: FiFileText },
            { path: KPI_ROUTES.ESCALATIONS, name: 'Escalations', icon: FiAlertCircle },
        ],
        reports: [
            { path: DASHBOARD_ROUTES.MANAGER.REPORTS, name: 'Team Reports', icon: FiFileText },
            { path: DASHBOARD_ROUTES.MANAGER.EXPORTS, name: 'Exports', icon: FiDownload },
            { path: KPI_ROUTES.KPI_REPORTS, name: 'Performance Reports', icon: FiBarChart2 },
        ],
        settings: [
            { path: DASHBOARD_ROUTES.MANAGER.SETTINGS, name: 'Settings', icon: FiSettings },
            { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Notifications', icon: FiBell },
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
                {renderNavGroup('Approvals & Validations', navigation.approvals, 'approvals')}
                {renderNavGroup('Reports & Exports', navigation.reports, 'reports')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
            </nav>
            
            <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
        </aside>
    );
};

export default ManagerSidebar;