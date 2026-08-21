import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  MANAGER_NAV_GROUPS,
  MANAGER_DEFAULT_EXPANDED,
  MANAGER_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const ManagerSidebar = ({ currentTenant, ...props }) => (
  <CollapsibleSidebar
    className="manager-sidebar"
    homePath={DASHBOARD_ROUTES.MANAGER.OVERVIEW}
    badgeTitle={currentTenant?.name || 'Organization'}
    badgeSubtitle="Manager View"
    navigationGroups={MANAGER_NAV_GROUPS}
    groupLabels={MANAGER_GROUP_LABELS}
    defaultExpanded={MANAGER_DEFAULT_EXPANDED}
    currentTenant={currentTenant}
    {...props}
  />
);

export default ManagerSidebar;