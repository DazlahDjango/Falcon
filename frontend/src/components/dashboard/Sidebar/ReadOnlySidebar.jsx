import React from 'react';
import { FiEye } from 'react-icons/fi';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  READ_ONLY_NAV_GROUPS,
  READ_ONLY_DEFAULT_EXPANDED,
  READ_ONLY_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const ReadOnlySidebar = ({ currentTenant, ...props }) => (
  <CollapsibleSidebar
    className="read-only-sidebar"
    homePath={DASHBOARD_ROUTES.READ_ONLY.OVERVIEW}
    badgeTitle={currentTenant?.name || 'Organization'}
    badgeSubtitle="Read-Only Access"
    navigationGroups={READ_ONLY_NAV_GROUPS}
    groupLabels={READ_ONLY_GROUP_LABELS}
    defaultExpanded={READ_ONLY_DEFAULT_EXPANDED}
    currentTenant={currentTenant}
    {...props}
  >
    {!props.isCollapsed && (
      <div className="readonly-badge">
        <FiEye size={14} />
        <span>Read-Only Mode</span>
      </div>
    )}
  </CollapsibleSidebar>
);

export default ReadOnlySidebar;