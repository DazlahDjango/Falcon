import React, { useState } from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from '../../../config/constants';
import { BILLING_ROUTES } from '../../../config/constants/billingRouteConstants';
import {
    FiHome, FiUsers, FiUserCheck, FiCalendar, FiBarChart2, FiSettings, FiShield, FiFileText, FiBell, FiLayers, FiChevronLeft,
    FiChevronRight, FiChevronDown, FiChevronUp, FiActivity, FiLock, FiDatabase, FiServer, FiMapPin, FiDollarSign, FiGitBranch, FiTrendingUp,
    FiCloud, FiHeart, FiFlag, FiSliders, FiHardDrive, FiRefreshCw, FiGrid, FiCreditCard, FiFileText as FiReceipt, 
    FiShoppingCart, FiDollarSign as FiCurrency, FiList, FiAlertCircle,
    FiPieChart, FiKey
} from 'react-icons/fi';
import { MdDomain, MdBusiness, MdStorage, MdBackup, MdSchema } from 'react-icons/md';
import { HiOutlineBuildingOffice, HiOutlineUserGroup } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge, BsDiagram3 } from 'react-icons/bs';

const Sidebar = ({ isOpen, isCollapsed, onToggle, user, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = useState({
        main: true,
        team: true,
        reporting: true,
        settings: true,
        admin: true,
        structure: true,     
        hierarchy: true,
        tenant: true,
        connections: true,
        tenantSpecific: true,
        billing: true,
        reviews: true,
        config: true,
    });
    const { tenantId: paramTenantId } = useParams();
    const location = useLocation();
    const currentTenant = useSelector((state) => state.appTenant.currentTenant);
    const hasTenantContext = paramTenantId || currentTenant?.id;

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const getNavigationItem = () => {
        const baseItems = [
            { path: '/dashboard', name: 'Dashboard', icon: FiHome, roles: ['all'] },
            { path: ROUTES.KPI_DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2, roles: ['all'] },
            // ✅ REMOVED old reviews entry from baseItems - now has its own section
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
        const structureItems = [
            { path: '/app/structure/dashboard/', name: 'Structure Dashboard', icon: FiTrendingUp, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion'] },
            { path: '/app/structure/departments', name: 'Departments', icon: HiOutlineBuildingOffice, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor', 'staff'] },
            { path: '/app/structure/teams', name: 'Teams', icon: HiOutlineUserGroup, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor', 'staff'] },
            { path: '/app/structure/positions', name: 'Positions', icon: BsBriefcase, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion'] },
            { path: '/app/structure/employments', name: 'Employments', icon: BsPersonBadge, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor'] },
            { path: '/app/structure/cost-centers', name: 'Cost Centers', icon: FiDollarSign, roles: ['super_admin', 'client_admin', 'executive'] },
            { path: '/app/structure/locations', name: 'Locations', icon: FiMapPin, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'staff'] },
        ];
        const hierarchyItems = [
            { path: '/app/structure/org-chart', name: 'Organization Chart', icon: FiGitBranch, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor', 'staff'] },
            { path: '/app/structure/department-trees', name: 'Department Tree', icon: FiGitBranch, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion'] },
            { path: '/app/structure/team-hierarchies', name: 'Team Hierarchy', icon: FiGitBranch, roles: ['super_admin', 'client_admin', 'executive', 'dashboard_champion', 'supervisor'] },
            { path: '/app/structure/hierarchy/versions', name: 'Version History', icon: FiDatabase, roles: ['super_admin', 'client_admin', 'executive'] },
        ];
        const tenantItems = [
            { path: '/tenants', name: 'All Tenants', icon: MdBusiness, roles: ['super_admin'] },
            { path: '/tenants/dashboard', name: 'Tenant Dashboard', icon: FiGrid, roles: ['super_admin'] },
            { path: '/tenants/create', name: 'Create Tenant', icon: MdBusiness, roles: ['super_admin'] },
        ];
        
        const tenantSpecificItems = [
            { path: '/tenants/:tenantId', name: 'Tenant Overview', icon: MdBusiness, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/edit', name: 'Edit Tenant', icon: FiSettings, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/resources', name: 'Resources', icon: FiDatabase, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/usage', name: 'Usage Analytics', icon: FiBarChart2, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/domains', name: 'Custom Domains', icon: MdDomain, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/backups', name: 'Backups', icon: MdBackup, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/migrations', name: 'Migrations', icon: FiRefreshCw, roles: ['super_admin'] },
            { path: '/tenants/:tenantId/schema', name: 'Database Schema', icon: MdSchema, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/connections', name: 'Database Connections', icon: FiActivity, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/provisioning', name: 'Provisioning Status', icon: FiCloud, roles: ['super_admin'] },
            { path: '/tenants/:tenantId/audit', name: 'Audit Logs', icon: FiActivity, roles: ['super_admin', 'client_admin'] },
            { path: '/tenants/:tenantId/settings', name: 'Settings', icon: FiSettings, roles: ['super_admin', 'client_admin'] },
        ];
        
        const connectionItems = [
            { path: '/tenants/connections', name: 'Connection Dashboard', icon: FiActivity, roles: ['super_admin'] },
            { path: '/tenants/connections/metrics', name: 'Connection Metrics', icon: FiBarChart2, roles: ['super_admin'] },
            { path: '/tenants/connections/health', name: 'Health Check', icon: FiHeart, roles: ['super_admin'] },
        ];
        const kpiItems = [
            { path: ROUTES.KPI_DASHBOARD, name: 'KPI Dashboard', icon: FiBarChart2, roles: ['super_admin','executive', 'supervisor', 'dashboard_champion']},
            { path: ROUTES.KPI_MANAGEMENT, name: 'KPI Management', icon: FiBarChart2, roles: ['super_admin', 'client_admin', 'dashboard_champion'] },
            { path: ROUTES.TARGETS, name: 'Targets', icon: FiCalendar, roles: ['super_admin', 'client_admin', 'dashboard_champion'] },
            { path: ROUTES.ACTUALS, name: 'Performance', icon: FiActivity, roles: ['all'] },
            { path: ROUTES.KPI_REPORTS, name: 'Reports', icon: FiBarChart2, roles: ['super_admin', 'client_admin', 'executive'] },
            { path: ROUTES.KPI_SETTINGS, name: 'KPI Operations', icon: FiSettings, roles: ['super_admin'] },
        ];
        const reviewsItems = [
            // 1. Entry Point
            { isHeader: true, name: 'Dashboards', roles: ['staff', 'supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/dashboard', name: 'Reviews Dashboard', icon: FiBarChart2, roles: ['staff', 'supervisor', 'client_admin', 'super_admin', 'executive'] },
            // 2. Setup & Configuration
            { isHeader: true, name: 'Setup & Configuration', roles: ['client_admin', 'super_admin'] },
            { path: '/reviews/rating-scales', name: 'Rating Scales', icon: FiGrid, roles: ['client_admin', 'super_admin'] },
            { path: '/reviews/competencies', name: 'Competencies', icon: FiList, roles: ['client_admin', 'super_admin'] },
            { path: '/reviews/templates', name: 'Templates', icon: FiFileText, roles: ['client_admin', 'super_admin'] },
            { path: '/reviews/coefficients', name: 'Coefficients', icon: FiActivity, roles: ['client_admin', 'super_admin'] },
            { path: '/reviews/settings', name: 'Reviews Settings', icon: FiSettings, roles: ['client_admin', 'super_admin'] },
            // 3. Cycles & Execution
            { isHeader: true, name: 'Cycles & Execution', roles: ['staff', 'supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/cycles', name: 'Review Cycles', icon: FiCalendar, roles: ['supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/self-assessment', name: 'Self Assessment', icon: FiUserCheck, roles: ['staff', 'supervisor', 'client_admin', 'super_admin'] },
            { path: '/reviews/feedback', name: '360 Feedback', icon: FiUsers, roles: ['staff', 'supervisor', 'client_admin', 'super_admin'] },
            { path: '/reviews/review-queue', name: 'Review Queue', icon: FiActivity, roles: ['supervisor', 'client_admin', 'super_admin'] },
            // 5. Calibration & Outcomes
            { isHeader: true, name: 'Calibration & Outcomes', roles: ['staff', 'supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/calibration', name: 'Calibration', icon: FiSliders, roles: ['supervisor', 'client_admin', 'super_admin'] },
            { path: '/reviews/final-ratings', name: 'Final Ratings', icon: FiBarChart2, roles: ['staff', 'supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/pips', name: 'Performance Plans', icon: FiFlag, roles: ['staff', 'supervisor', 'client_admin', 'super_admin', 'executive'] },
            // 6. Analytics & Reports
            { isHeader: true, name: 'Analytics & Reports', roles: ['supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/reports', name: 'Reviews Reports', icon: FiFileText, roles: ['supervisor', 'client_admin', 'super_admin', 'executive'] },
            { path: '/reviews/analytics', name: 'Analytics', icon: FiTrendingUp, roles: ['supervisor', 'client_admin', 'super_admin', 'executive'] },
        ];
        const configItems = [
            { path: '/config/dashboard', name: 'Config Dashboard', icon: FiServer, roles: ['super_admin', 'client_admin'] },
            { path: '/config/backups', name: 'Backups', icon: MdBackup, roles: ['super_admin', 'client_admin'] },
            { path: '/config/maintenance', name: 'Maintenance', icon: FiHardDrive, roles: ['super_admin', 'client_admin'] },
            { path: '/config/disaster-recovery', name: 'Disaster Recovery', icon: FiShield, roles: ['super_admin', 'client_admin'] },
            { path: '/config/health', name: 'Health Check', icon: FiActivity, roles: ['super_admin', 'client_admin'] },
            { path: '/config/schedules', name: 'Schedules', icon: FiCalendar, roles: ['super_admin', 'client_admin'] },
            { path: '/config/quotas', name: 'Quotas', icon: FiPieChart, roles: ['super_admin', 'client_admin'] },
            { path: '/config/encryption', name: 'Encryption', icon: FiKey, roles: ['super_admin'] },
            { path: '/config/audit-logs', name: 'Audit Logs', icon: FiList, roles: ['super_admin'] },
            { path: '/config/settings', name: 'Config Settings', icon: FiSettings, roles: ['super_admin', 'client_admin'] },
        ];
        const billingItems = [
            { path: BILLING_ROUTES.PORTAL, name: 'Billing Overview', icon: FiCreditCard, roles: ['super_admin', 'client_admin', 'executive'] },
            { path: BILLING_ROUTES.PLANS, name: 'Plans', icon: FiDollarSign, roles: ['all'] },
            { path: BILLING_ROUTES.SUBSCRIPTIONS, name: 'Subscriptions', icon: FiCreditCard, roles: ['super_admin', 'client_admin'] },
            { path: BILLING_ROUTES.INVOICES, name: 'Invoices', icon: FiReceipt, roles: ['all'] },
            { path: BILLING_ROUTES.TRANSACTIONS, name: 'Transactions', icon: FiDollarSign, roles: ['super_admin', 'client_admin'] },
            { path: BILLING_ROUTES.PAYMENT_METHODS, name: 'Payment Methods', icon: FiCreditCard, roles: ['all'] },
            { path: BILLING_ROUTES.SETTINGS, name: 'Billing Settings', icon: FiSettings, roles: ['super_admin', 'client_admin'] },
            { path: BILLING_ROUTES.ADMIN_BASE, name: 'Billing Admin', icon: FiPieChart, roles: ['super_admin'] },
        ];
        const adminItems = [
            { path: '/admin/users', name: 'Admin Users', icon: FiUsers, roles: ['super_admin'] },
            { path: '/tenants', name: 'Tenants', icon: FiLayers, roles: ['super_admin'] },
            { path: '/admin/system', name: 'System', icon: FiServer, roles: ['super_admin'] },
            { path: '/admin/cache', name: 'Cache', icon: FiDatabase, roles: ['super_admin'] },
        ];
        
        
        
        // ✅ UPDATED return statement - added reviews
        return {
            main: baseItems,
            team: teamItems,
            reporting: reportingItems,
            settings: settingsItems,
            structure: structureItems,
            hierarchy: hierarchyItems,
            tenant: tenantItems,
            tenantSpecific: tenantSpecificItems,
            connections: connectionItems,
            kpi: kpiItems,
            reviews: reviewsItems,
            config: configItems,
            billing: billingItems,
            admin: adminItems
        };
    };
    
    const navigation = getNavigationItem();
    
    const hasAccess = (roles) => {
        if (roles.includes('all')) return true;
        if (user?.role && roles.includes(user.role)) return true;
        return false;
    };
    
    const resolvePath = (path) => {
        return path.replace(':tenantId', paramTenantId || currentTenant?.id || '');
    };
    
    const renderNavGroup = (title, items, groupKey) => {
        const filteredItems = items.filter(item => hasAccess(item.roles));
        if (filteredItems.length === 0) return null;
        
        const isExpanded = expandedMenus[groupKey];
        const Icon = isExpanded ? FiChevronUp : FiChevronDown;
        
        return (
            <div className="nav-group" key={groupKey}>
                <button className="nav-group-header" onClick={() => toggleMenu(groupKey)} disabled={isCollapsed}>
                    <span className="nav-group-title">{title}</span>
                    {!isCollapsed && <Icon size={16} />}
                </button>
                {(isExpanded || isCollapsed) && (
                    <ul className="nav-group-items">
                        {filteredItems.map((item) => {
                            if (item.isHeader) {
                                return (
                                    <li key={item.name} className="nav-group-subheader">
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </li>
                                );
                            }
                            return (
                                <li key={item.path}>
                                    <NavLink 
                                        to={resolvePath(item.path)}
                                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                        end={item.path === BILLING_ROUTES.PORTAL || item.path === BILLING_ROUTES.ADMIN_BASE}
                                    >
                                        <item.icon size={20} />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </NavLink>
                                </li>
                            );
                        })}
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
                <button className="sidebar-toggle" onClick={onToggle}>
                    {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                </button>
            </div>
            
            {/* Tenant Info */}
            {!isCollapsed && currentTenant && (
                <div className="sidebar-tenant">
                    <div className="tenant-name">{currentTenant.name}</div>
                    <div className="tenant-plan">{currentTenant.subscription_plan}</div>
                </div>
            )}
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {renderNavGroup('Main', navigation.main, 'main')}
                {renderNavGroup('Team', navigation.team, 'team')}
                {renderNavGroup('Reporting', navigation.reporting, 'reporting')}
                {renderNavGroup('Settings', navigation.settings, 'settings')}
                {renderNavGroup('Organization Structure', navigation.structure, 'structure')}
                {renderNavGroup('Hierarchy & Charts', navigation.hierarchy, 'hierarchy')}
                {renderNavGroup('Configuration', navigation.config, 'config')}
                {renderNavGroup('Billing', navigation.billing, 'billing')}
                {user?.role === 'super_admin' && renderNavGroup('Tenant Management', navigation.tenant, 'tenant')}
                
                {hasTenantContext && (user?.role === 'super_admin' || user?.role === 'client_admin') && 
                    renderNavGroup(
                        `Tenant: ${currentTenant?.name || 'Current Tenant'}`, 
                        navigation.tenantSpecific, 
                        'tenantSpecific'
                    )
                }
                {user?.role === 'super_admin' && renderNavGroup('Connection Management', navigation.connections, 'connections')}
                {renderNavGroup('KPI', navigation.kpi, 'kpi')}
                {renderNavGroup('Reviews', navigation.reviews, 'reviews')}
                {user?.role === 'super_admin' && renderNavGroup('Admin', navigation.admin, 'admin')}
            </nav>
            
            {/* User Info at Bottom */}
            {!isCollapsed && user && (
                <div className="sidebar-user">
                    <div className="user-avatar-small">
                        {user.avatar_url ? (
                            <img 
                                src={user.avatar_url} 
                                alt={user.username}
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.first_name || user.username}</div>
                        <div className="user-role">{user.role_display || user.role}</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export { Sidebar };