import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FiHome, FiBarChart2, FiUsers, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiBell, FiGrid, FiPieChart, FiFileText,
    FiTarget, FiActivity, FiAward, FiGitBranch, FiMapPin, FiDollarSign,
    FiLayers, FiBriefcase
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3 } from 'react-icons/bs';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

const ExecutiveSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath, wsConnected }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        performance: true,
        organization: true,
        structure: false,
        reports: true,
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
            { path: DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
            { path: DASHBOARD_ROUTES.EXECUTIVE.DEPARTMENTS, name: 'Departments', icon: FiGrid },
            { path: DASHBOARD_ROUTES.EXECUTIVE.TEAM, name: 'Organization', icon: FiUsers },
        ],
        performance: [
            { path: DASHBOARD_ROUTES.EXECUTIVE.TRENDS, name: 'KPIs & Trends', icon: FiTrendingUp },
            { path: DASHBOARD_ROUTES.EXECUTIVE.COMPARISONS, name: 'Comparisons', icon: FiPieChart },
            { path: DASHBOARD_ROUTES.EXECUTIVE.ALERTS, name: 'Alerts', icon: FiAlertCircle },
            { path: KPI_ROUTES.KPI_ANALYTICS, name: 'Analytics Insights', icon: FiActivity },
            { path: '/organization-health', name: 'Organization Health', icon: FiAward },
        ],
        organization: [
            { path: KPI_ROUTES.TARGETS, name: 'Targets Overview', icon: FiTarget },
            { path: KPI_ROUTES.AGGREGATED_SCORES, name: 'Aggregated Scores', icon: FiBarChart2 },
            { path: KPI_ROUTES.AGGREGATED_SCORES_DEPARTMENTS, name: 'Department Scores', icon: FiGrid },
            { path: KPI_ROUTES.AGGREGATED_SCORES_RANKING, name: 'Department Ranking', icon: FiAward },
        ],
        structure: [
            { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiBarChart2 },
            { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
            { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
            { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
            { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: FiUsers },
            { path: STRUCTURE_ROUTES.REPORTING_LINES, name: 'Reporting Lines', icon: BsDiagram3 },
            { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
            { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
            { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
            { path: STRUCTURE_ROUTES.HIERARCHY_CURRENT, name: 'Hierarchy', icon: FiLayers },
        ],
        reports: [
            { path: DASHBOARD_ROUTES.EXECUTIVE.REPORTS, name: 'Reports', icon: FiFileText },
            { path: DASHBOARD_ROUTES.EXECUTIVE.EXPORTS, name: 'Exports', icon: FiDownload },
            { path: KPI_ROUTES.KPI_REPORTS, name: 'Custom Reports', icon: FiFileText },
        ],
        settings: [
            { path: DASHBOARD_ROUTES.EXECUTIVE.SETTINGS, name: 'Settings', icon: FiSettings },
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
        <aside className={`sidebar executive-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW} className="logo-link">
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
            
            {!isCollapsed && currentTenant && (
                <div className="sidebar-tenant">
                    <div className="tenant-name">{currentTenant.name}</div>
                    <div className="tenant-plan">Executive View</div>
                </div>
            )}
            
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Performance Analytics', navigation.performance, 'performance')}
                {renderNavGroup('Organization Performance', navigation.organization, 'organization')}
                {renderNavGroup('Organization Structure', navigation.structure, 'structure')}
                {renderNavGroup('Reports & Exports', navigation.reports, 'reports')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
            </nav>
            
            <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
        </aside>
    );
};

export default ExecutiveSidebar;