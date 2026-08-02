import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronDown, 
  FiChevronUp,
  FiHome, 
  FiBarChart2, 
  FiUsers, 
  FiShield, 
  FiAlertCircle, 
  FiDownload, 
  FiSettings, 
  FiDatabase, 
  FiActivity, 
  FiServer, 
  FiGrid, 
  FiDollarSign, 
  FiFileText, 
  FiBell, 
  FiClock, 
  FiTrendingUp, 
  FiLock, 
  FiHardDrive, 
  FiRefreshCw, 
  FiKey, 
  FiList, 
  FiGitBranch, 
  FiLayers, 
  FiCalendar, 
  FiFlag, 
  FiSliders, 
  FiCheckCircle, 
  FiMapPin, 
  FiBriefcase, 
  FiPackage, 
  FiFolder, 
  FiPieChart, 
  FiSmartphone, 
  FiCode, 
  FiCreditCard, 
  FiEye, 
  FiRotateCcw, 
  FiTarget, 
  FiStar, 
  FiAward, 
  FiUserCheck, 
  FiUserX, 
  FiUser, 
  FiGlobe, 
  FiLink
} from 'react-icons/fi';
import { MdBusiness } from 'react-icons/md';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsDiagram3 } from 'react-icons/bs';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

const GROUP_ICONS = {
  main: FiGrid,
  tenant_main: FiHome,
  tenant_management: HiOutlineBuildingOffice,
  tenant_infrastructure: FiDatabase,
  tenant_system: FiSettings,
  billing: FiCreditCard,
  kpiAdmin: FiPieChart,
  kpiManagement: FiTarget,
  kpiAnalytics: FiActivity,
  kpiOperations: FiDatabase,
  kpiDashboards: FiHome,
  structure: BsDiagram3,
  reviews: FiStar,
  accounts: FiUsers,
  mfa: FiSmartphone,
  config: FiSliders,
  settings: FiSettings,
};

/**
 * Shared collapsible sidebar shell for PMS dashboard roles.
 * Upgraded to support premium enterprise styling and behaviors.
 */
const CollapsibleSidebar = ({
  className = '',
  homePath,
  badgeTitle,
  badgeSubtitle,
  navigationGroups = {},
  groupLabels = {},
  defaultExpanded = {},
  isOpen,
  isCollapsed,
  onToggle,
  user,
  wsConnected,
  children,
}) => {
  const [expandedMenus, setExpandedMenus] = useState(defaultExpanded);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const renderNavGroup = (title, items, groupKey) => {
    if (!items?.length) return null;

    // Strip leading emoji icons from the label to align with the visual mockup
    const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/🏢|🏗️|📊|📈|⚙️|📺|🏛️|⭐|👥/g, '').trim();
    
    const isExpanded = expandedMenus[groupKey];
    
    // Check if any of the sub-items in this group is currently active
    const currentPath = window.location.pathname;
    const isAnyActive = items.some(item => {
      return item.path && (currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path)));
    });

    const Chevron = isExpanded ? FiChevronUp : FiChevronDown;
    const GroupIcon = GROUP_ICONS[groupKey] || FiGrid;

    // Render "main" or "tenant_main" as flat list of navlinks
    const isFlatGroup = groupKey === 'main' || groupKey === 'tenant_main';

    if (isFlatGroup) {
      return (
        <div className="ent-nav-group-flat" key={groupKey}>
          {!isCollapsed && <div className="ent-nav-group-header-label">{cleanTitle}</div>}
          <ul className="ent-nav-group-items-flat" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((item) => {
              const ItemIcon = item.icon || FiGrid;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `ent-nav-link ${isActive ? 'active' : ''}`}
                    end={item.end}
                  >
                    <ItemIcon size={20} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <div className={`ent-nav-group ${isExpanded ? 'expanded' : ''} ${isAnyActive ? 'parent-active' : ''}`} key={groupKey}>
        <button
          type="button"
          className={`ent-nav-group-header ${isAnyActive ? 'active' : ''}`}
          onClick={() => toggleMenu(groupKey)}
          disabled={isCollapsed}
        >
          <div className="ent-nav-group-header-left">
            <GroupIcon size={20} />
            {!isCollapsed && <span className="ent-nav-group-title">{cleanTitle}</span>}
          </div>
          {!isCollapsed && <Chevron size={16} className="ent-chevron" />}
        </button>
        {((isExpanded && !isCollapsed) || (isCollapsed && isAnyActive)) && (
          <ul className="ent-nav-group-items">
            {items.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li key={`header-${index}`} className="ent-nav-group-subheader">
                    <span>{item.name}</span>
                  </li>
                );
              }
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `ent-sub-nav-link ${isActive ? 'active' : ''}`}
                    end={item.end}
                  >
                    <span className="ent-sub-nav-bullet">●</span>
                    <span>{item.name}</span>
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
    <aside className={`ent-sidebar ${className} ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'ent-collapsed' : ''}`}>
      <div className="ent-sidebar-logo">
        <NavLink to={homePath} className="ent-logo-link">
          <div className="ent-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Shield with Falcon bird wings silhouette */}
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6L8 10H16L12 6Z" fill="currentColor" />
              <path d="M12 10L10 14H14L12 10Z" fill="currentColor" />
            </svg>
          </div>
          {!isCollapsed && <span className="ent-logo-text">Falcon PMS</span>}
        </NavLink>
        <button type="button" className="ent-sidebar-toggle" onClick={onToggle}>
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {!isCollapsed && badgeTitle && (
        <div className="ent-sidebar-tenant">
          <div className="ent-tenant-name">{badgeTitle}</div>
          {badgeSubtitle && <div className="ent-tenant-plan">{badgeSubtitle}</div>}
        </div>
      )}

      {children}

      <nav className="ent-sidebar-nav">
        {Object.entries(navigationGroups).map(([groupKey, items]) =>
          renderNavGroup(groupLabels[groupKey] || groupKey, items, groupKey),
        )}
      </nav>

      <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
    </aside>
  );
};

export default CollapsibleSidebar;
