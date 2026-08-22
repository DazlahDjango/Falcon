import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  EXECUTIVE_NAV_GROUPS,
  EXECUTIVE_DEFAULT_EXPANDED,
  EXECUTIVE_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const ExecutiveSidebar = ({ currentTenant, ...props }) => (
  <CollapsibleSidebar
    className="executive-sidebar"
    homePath={DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW}
    badgeTitle={currentTenant?.name || 'Organization'}
    badgeSubtitle="Executive View"
    navigationGroups={EXECUTIVE_NAV_GROUPS}
    groupLabels={EXECUTIVE_GROUP_LABELS}
    defaultExpanded={EXECUTIVE_DEFAULT_EXPANDED}
    currentTenant={currentTenant}
    {...props}
  />
);

export default ExecutiveSidebar;