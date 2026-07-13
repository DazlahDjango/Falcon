import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FiHome, FiBarChart2, FiUsers, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiBell, FiGrid, FiPieChart, FiFileText,
    FiTarget, FiCheckCircle, FiClock, FiShield, FiActivity, FiDatabase,
    FiGitBranch, FiMapPin, FiDollarSign, FiLayers, FiBriefcase
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3, BsPersonBadge } from 'react-icons/bs';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES, KPI_ADMIN_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

const ChampionSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath, wsConnected }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        oversight: true,
        kpiAdmin: false,
        kpiManagement: false,
        structure: false,
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
            { path: DASHBOARD_ROUTES.CHAMPION.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
            { path: DASHBOARD_ROUTES.CHAMPION.CONFIGURATION, name: 'Champion Dashboard', icon: FiShield },
        ],
        oversight: [
            { path: DASHBOARD_ROUTES.CHAMPION.APPROVALS, name: 'Pending Approvals', icon: FiClock },
            { path: DASHBOARD_ROUTES.CHAMPION.MISSING_DATA, name: 'Missing Data', icon: FiAlertCircle },
            { path: DASHBOARD_ROUTES.CHAMPION.USER_ACTIVITY, name: 'User Activity', icon: FiActivity },
            { path: '/validations', name: 'Validations Queue', icon: FiCheckCircle },
            { path: '/escalations', name: 'Escalations', icon: FiAlertCircle },
        ],
        kpiAdmin: [
            { path: KPI_ADMIN_ROUTES.OVERVIEW, name: 'KPI Admin Overview', icon: FiPieChart },
            { path: KPI_ADMIN_ROUTES.SECTORS, name: 'Sectors', icon: FiGrid },
            { path: KPI_ADMIN_ROUTES.FRAMEWORKS, name: 'Frameworks', icon: FiDatabase },
            { path: KPI_ADMIN_ROUTES.CATEGORIES, name: 'Categories', icon: FiFileText },
            { path: KPI_ADMIN_ROUTES.TEMPLATES, name: 'Templates', icon: FiTarget },
        ],
        kpiManagement: [
            { path: KPI_ROUTES.KPI_MANAGEMENT, name: 'All KPIs', icon: FiTarget },
            { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiUsers },
            { path: KPI_ROUTES.TARGETS, name: 'Targets', icon: FiBarChart2 },
            { path: KPI_ROUTES.ACTUALS, name: 'Actuals', icon: FiCheckCircle },
            { path: '/bulk-upload', name: 'Bulk Upload', icon: FiDownload },
        ],
        structure: [
            { path: STRUCTURE_ROUTES.DASHBOARD, name: 'Structure Dashboard', icon: FiBarChart2 },
            { path: STRUCTURE_ROUTES.DEPARTMENTS, name: 'Departments', icon: HiOutlineBuildingOffice },
            { path: STRUCTURE_ROUTES.DIVISIONS, name: 'Divisions', icon: FiGitBranch },
            { path: STRUCTURE_ROUTES.SECTIONS, name: 'Sections', icon: FiLayers },
            { path: STRUCTURE_ROUTES.POSITIONS, name: 'Positions', icon: FiBriefcase },
            { path: STRUCTURE_ROUTES.EMPLOYMENTS, name: 'Employments', icon: BsPersonBadge },
            { path: STRUCTURE_ROUTES.ORG_CHARTS, name: 'Org Chart', icon: FiGitBranch },
            { path: STRUCTURE_ROUTES.COST_CENTERS, name: 'Cost Centers', icon: FiDollarSign },
            { path: STRUCTURE_ROUTES.LOCATIONS, name: 'Locations', icon: FiMapPin },
        ],
        reports: [
            { path: KPI_ROUTES.KPI_ANALYTICS, name: 'Analytics Insights', icon: FiTrendingUp },
            { path: KPI_ROUTES.KPI_REPORTS, name: 'Reports', icon: FiFileText },
            { path: '/organization-health', name: 'Organization Health', icon: FiActivity },
        ],
        settings: [
            { path: KPI_ROUTES.SYSTEM_SETTINGS, name: 'System Settings', icon: FiSettings },
            { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference Data', icon: FiDatabase },
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
        <aside className={`sidebar champion-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.CHAMPION.OVERVIEW} className="logo-link">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 12L12 15L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <div className="tenant-plan">Champion View</div>
                </div>
            )}
            
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Oversight', navigation.oversight, 'oversight')}
                {renderNavGroup('KPI System Admin', navigation.kpiAdmin, 'kpiAdmin')}
                {renderNavGroup('KPI Management', navigation.kpiManagement, 'kpiManagement')}
                {renderNavGroup('Organization Structure', navigation.structure, 'structure')}
                {renderNavGroup('Reports & Analytics', navigation.reports, 'reports')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
            </nav>
            
            <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
        </aside>
    );
};

export default ChampionSidebar;