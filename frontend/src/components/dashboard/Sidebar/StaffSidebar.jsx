import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FiHome, FiBarChart2, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiBell, FiFileText, FiTarget,
    FiCheckCircle, FiClock, FiAward, FiCalendar
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

const StaffSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath, wsConnected }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        performance: true,
        tasks: true,
        history: false,
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
            { path: DASHBOARD_ROUTES.STAFF.OVERVIEW, name: 'Overview', icon: FiHome, end: true },
            { path: KPI_ROUTES.DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2 },
        ],
        performance: [
            { path: KPI_ROUTES.KPI_MY_KPIS, name: 'My KPIs', icon: FiTarget },
            { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'My Scores', icon: FiTrendingUp },
            { path: KPI_ROUTES.SCORE_STATISTICS, name: 'Performance Stats', icon: FiBarChart2 },
            { path: '/my-performance', name: 'Mission Status', icon: FiFileText },
        ],
        tasks: [
            { path: KPI_ROUTES.ACTUAL_SUBMIT, name: 'Submit Actuals', icon: FiCheckCircle },
            { path: KPI_ROUTES.ACTUALS, name: 'My Submissions', icon: FiClock },
            { path: KPI_ROUTES.SCORE_RED_ALERTS, name: 'Red Alerts', icon: FiAlertCircle },
        ],
        history: [
            { path: KPI_ROUTES.SCORE_MY_SCORES, name: 'Performance History', icon: FiAward },
            { path: KPI_ROUTES.ACTUAL_HISTORY, name: 'Past Submissions', icon: FiCalendar },
        ],
        settings: [
            { path: KPI_ROUTES.NOTIFICATION_PREFERENCES, name: 'Preferences', icon: FiSettings },
            { path: KPI_ROUTES.REFERENCE_DATA, name: 'Reference', icon: FiBell },
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
        <aside className={`sidebar staff-sidebar ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Area */}
            <div className="sidebar-logo">
                <NavLink to={DASHBOARD_ROUTES.STAFF.OVERVIEW} className="logo-link">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="2" fill="currentColor"/>
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
                    <div className="tenant-plan">Staff View</div>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('My Performance', navigation.performance, 'performance')}
                {renderNavGroup('Tasks & Submissions', navigation.tasks, 'tasks')}
                {renderNavGroup('History', navigation.history, 'history')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
            </nav>
            
            <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
        </aside>
    );
};

export default StaffSidebar;