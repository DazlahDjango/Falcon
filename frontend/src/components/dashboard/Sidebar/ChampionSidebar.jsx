// frontend/src/components/dashboard/Sidebar/ChampionSidebar.jsx

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiBarChart2, FiUsers, FiTrendingUp, FiAlertCircle, 
    FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
    FiDownload, FiSettings, FiHelpCircle, FiLogOut, FiBell,
    FiGrid, FiPieChart, FiCalendar, FiFileText, FiStar, FiEdit,
    FiLayers, FiCopy, FiSave, FiUserPlus
} from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';

const ChampionSidebar = ({ isOpen, isCollapsed, onToggle, user, currentTenant, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        configuration: true,
        templates: true,
        bulk: false,
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
        ],
        configuration: [
            { path: DASHBOARD_ROUTES.CHAMPION.CONFIGURATION, name: 'Dashboard Config', icon: FiSettings },
            { path: DASHBOARD_ROUTES.CHAMPION.CONFIGURATION, name: 'KPI Assignment', icon: FiBarChart2 },
            { path: DASHBOARD_ROUTES.CHAMPION.CONFIGURATION, name: 'Target Settings', icon: FiTarget },
        ],
        templates: [
            { path: DASHBOARD_ROUTES.CHAMPION.TEMPLATES, name: 'Template Library', icon: FiLayers },
            { path: DASHBOARD_ROUTES.CHAMPION.CREATE_TEMPLATE, name: 'Create Template', icon: FiCopy },
            { path: DASHBOARD_ROUTES.CHAMPION.TEMPLATES, name: 'Saved Templates', icon: FiSave },
        ],
        bulk: [
            { path: DASHBOARD_ROUTES.CHAMPION.BULK_ASSIGN, name: 'Bulk Assign', icon: FiUserPlus },
            { path: DASHBOARD_ROUTES.CHAMPION.BULK_ASSIGN, name: 'Mass Update', icon: FiEdit },
        ],
        settings: [
            { path: DASHBOARD_ROUTES.CHAMPION.SETTINGS, name: 'Champion Settings', icon: FiSettings },
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
            {/* Logo Area */}
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
            
            {/* Tenant Info */}
            {!isCollapsed && currentTenant && (
                <div className="sidebar-tenant">
                    <div className="tenant-name">{currentTenant.name}</div>
                    <div className="tenant-plan">Champion View</div>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Dashboard Configuration', navigation.configuration, 'configuration')}
                {renderNavGroup('Templates', navigation.templates, 'templates')}
                {renderNavGroup('Bulk Operations', navigation.bulk, 'bulk')}
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
                        <div className="user-role">Dashboard Champion</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default ChampionSidebar;