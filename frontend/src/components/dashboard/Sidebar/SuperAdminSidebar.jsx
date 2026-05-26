import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  SUPER_ADMIN_NAV_GROUPS,
  SUPER_ADMIN_DEFAULT_EXPANDED,
  SUPER_ADMIN_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const SuperAdminSidebar = (props) => (
  <CollapsibleSidebar
    className="superadmin-sidebar"
    homePath={DASHBOARD_ROUTES.SUPER_ADMIN.OVERVIEW}
    badgeTitle="Platform Admin"
    badgeSubtitle="Super Admin"
    navigationGroups={SUPER_ADMIN_NAV_GROUPS}
    groupLabels={SUPER_ADMIN_GROUP_LABELS}
    defaultExpanded={SUPER_ADMIN_DEFAULT_EXPANDED}
    {...props}
  />
);

export default SuperAdminSidebar;
