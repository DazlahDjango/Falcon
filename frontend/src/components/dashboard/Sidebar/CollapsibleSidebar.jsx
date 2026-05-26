import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SidebarUserPanel } from '../common/SidebarUserPanel';

/**
 * Shared collapsible sidebar shell for PMS dashboard roles.
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

    const isExpanded = expandedMenus[groupKey];
    const Chevron = isExpanded ? FiChevronUp : FiChevronDown;

    return (
      <div className="nav-group" key={groupKey}>
        <button
          type="button"
          className="nav-group-header"
          onClick={() => toggleMenu(groupKey)}
          disabled={isCollapsed}
        >
          <span className="nav-group-title">{title}</span>
          {!isCollapsed && <Chevron size={16} />}
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
    <aside className={`sidebar ${className} ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <NavLink to={homePath} className="logo-link">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {!isCollapsed && <span className="logo-text">Falcon PMS</span>}
        </NavLink>
        <button type="button" className="sidebar-toggle" onClick={onToggle}>
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {!isCollapsed && badgeTitle && (
        <div className="sidebar-tenant">
          <div className="tenant-name">{badgeTitle}</div>
          {badgeSubtitle && <div className="tenant-plan">{badgeSubtitle}</div>}
        </div>
      )}

      <nav className="sidebar-nav">
        {Object.entries(navigationGroups).map(([groupKey, items]) =>
          renderNavGroup(groupLabels[groupKey] || groupKey, items, groupKey),
        )}
      </nav>

      <SidebarUserPanel user={user} isCollapsed={isCollapsed} wsConnected={wsConnected} />
    </aside>
  );
};

export default CollapsibleSidebar;
