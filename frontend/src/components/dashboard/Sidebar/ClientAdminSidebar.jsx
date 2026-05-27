import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  CLIENT_ADMIN_NAV_GROUPS,
  CLIENT_ADMIN_DEFAULT_EXPANDED,
  CLIENT_ADMIN_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const ClientAdminSidebar = ({ currentTenant, ...props }) => (
  <CollapsibleSidebar
    className="client-sidebar"
    homePath={DASHBOARD_ROUTES.CLIENT_ADMIN.OVERVIEW}
    badgeTitle={currentTenant?.name || 'Organization'}
    badgeSubtitle="Client Admin"
    navigationGroups={CLIENT_ADMIN_NAV_GROUPS}
    groupLabels={CLIENT_ADMIN_GROUP_LABELS}
    defaultExpanded={CLIENT_ADMIN_DEFAULT_EXPANDED}
    {...props}
  />
);

export default ClientAdminSidebar;
