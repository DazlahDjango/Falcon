import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome, FiUsers, FiUserCheck, FiCalendar, FiBarChart2, FiSettings, FiShield, FiFileText, FiBell, FiLayers, FiChevronLeft,
    FiChevronRight, FiChevronDown, FiChevronUp, FiActivity, FiLock, FiDatabase, FiServer, FiBriefcase
} from 'react-icons/fi';
import { getNavigationItems } from "@config/rootes";

const ICON_MAP = {
    dashboard: FiHome,
    users: FiUserCheck,
    team: FiUsers,
    roles: FiShield,
    sessions: FiLock,
    settings: FiSettings,
    audit: FiActivity,
    admin: FiLayers,
    organisation: FiBriefcase,
    reports: FiBarChart2,
    kpi: FiBarChart2,
    reviews: FiFileText
};

const Sidebar = ({ isOpen, isCollapsed, onToggle, user, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({ organisation: true }); // Default expand organisation
    const { tenant } = useSelector((state) => state.tenant);

    const navigationItems = getNavigationItems(user?.role);

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const renderNavItem = (item) => {
        const Icon = ICON_MAP[item.icon] || FiFileText;
        
        if (item.children) {
            const isExpanded = expandedMenus[item.name.toLowerCase()];
            const ChevronIcon = isExpanded ? FiChevronUp : FiChevronDown;
            
            return (
                <div className="nav-group" key={item.name}>
                    <button 
                        className="nav-group-header" 
                        onClick={() => toggleMenu(item.name.toLowerCase())} 
                        disabled={isCollapsed}
                    >
                        <div className="flex items-center">
                            <Icon size={20} />
                            {!isCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
                        </div>
                        {!isCollapsed && <ChevronIcon size={16} />}
                    </button>
                    {(isExpanded || isCollapsed) && (
                        <ul className="nav-group-items pl-4 mt-1 space-y-1">
                            {item.children.map((child, index) => (
                                <li key={child.path || child.name || index}>
                                    <NavLink 
                                        to={child.path}
                                        className={({ isActive }) => `nav-link py-2 px-3 flex items-center rounded-md transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <span className="text-xs mr-2">•</span>
                                        {!isCollapsed && <span>{child.name}</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        }

        return (
            <li key={item.path || item.name}>
                <NavLink 
                    to={item.path}
                    className={({ isActive }) => `nav-link py-2 px-3 flex items-center rounded-md transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <Icon size={20} />
                    {!isCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
                </NavLink>
            </li>
        );
    };

    return (
        <aside className={`sidebar flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 lg:w-20'} ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
            {/* Logo Area */}
            <div className="sidebar-logo h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <NavLink to="/dashboard" className="flex items-center overflow-hidden">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    {!isCollapsed && <span className="ml-3 text-xl font-bold text-gray-900 truncate">Falcon PMS</span>}
                </NavLink>
                <button className="lg:hidden" onClick={onToggle}>
                    <FiChevronLeft size={24} />
                </button>
            </div>

            {/* Tenant Info */}
            {!isCollapsed && tenant && (
                <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="text-sm font-bold text-gray-900 truncate">{tenant.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{tenant.subscription_plan} Plan</div>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                <ul className="space-y-1">
                    {navigationItems.map(renderNavItem)}
                </ul>
            </nav>

            {/* User Info at Bottom */}
            {!isCollapsed && user && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <img 
                            className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                            src={user.avatar_url || '/static/accounts/img/default-avatar.png'} 
                            alt={user.username}
                        />
                        <div className="ml-3 overflow-hidden">
                            <div className="text-sm font-semibold text-gray-900 truncate">{user.first_name || user.username}</div>
                            <div className="text-xs text-gray-500 truncate capitalize">{user.role_display || user.role}</div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export { Sidebar };