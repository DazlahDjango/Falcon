import React from 'react';
import { DASHBOARD_ROUTES } from '../../../config/constants/dashboardRouteConstants';
import {
  CHAMPION_NAV_GROUPS,
  CHAMPION_DEFAULT_EXPANDED,
  CHAMPION_GROUP_LABELS,
} from '../../../config/navigation/platformAdminNav';
import CollapsibleSidebar from './CollapsibleSidebar';

const ChampionSidebar = ({ currentTenant, ...props }) => (
  <CollapsibleSidebar
    className="champion-sidebar"
    homePath={DASHBOARD_ROUTES.CHAMPION.OVERVIEW}
    badgeTitle={currentTenant?.name || 'Organization'}
    badgeSubtitle="Champion View"
    navigationGroups={CHAMPION_NAV_GROUPS}
    groupLabels={CHAMPION_GROUP_LABELS}
    defaultExpanded={CHAMPION_DEFAULT_EXPANDED}
    currentTenant={currentTenant}
    {...props}
  />
);

export default ChampionSidebar;