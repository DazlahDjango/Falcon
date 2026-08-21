import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  STAFF_NAV_GROUPS,
  STAFF_DEFAULT_EXPANDED,
  STAFF_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const StaffSidebar = ({ currentTenant, ...props }) => (
  <CollapsibleSidebar
    className="staff-sidebar"
    homePath={DASHBOARD_ROUTES.STAFF.OVERVIEW}
    badgeTitle={currentTenant?.name || 'Organization'}
    badgeSubtitle="Staff View"
    navigationGroups={STAFF_NAV_GROUPS}
    groupLabels={STAFF_GROUP_LABELS}
    defaultExpanded={STAFF_DEFAULT_EXPANDED}
    currentTenant={currentTenant}
    {...props}
  />
);

export default StaffSidebar;