import { fetchDepartments } from '../slice/departmentSlice';
import { fetchTeams } from '../slice/teamSlice';
import { fetchPositions } from '../slice/positionSlice';
import { fetchCurrentSubscription } from '../slice/subscriptionSlice';
import { fetchCurrentOrganisation } from '../slice/organisationSlice';
import { fetchBranding } from '../slice/brandingSlice';
import { fetchSettings } from '../slice/settingsSlice';
import { fetchAuditStats } from '../slice/auditSlice';
import { fetchKpiOverview } from '../slice/kpiSlice';

// Actions that trigger related data refreshes
const SYNC_ACTIONS = {
  // Organisation updates trigger settings and branding refresh
  'organisation/update/fulfilled': [fetchCurrentOrganisation, fetchBranding, fetchSettings],
  'organisation/uploadLogo/fulfilled': [fetchBranding],
  
  // Subscription updates trigger subscription refresh
  'subscription/upgrade/fulfilled': [fetchCurrentSubscription],
  'subscription/cancel/fulfilled': [fetchCurrentSubscription],
  'subscription/reactivate/fulfilled': [fetchCurrentSubscription],
  'subscription/addPaymentMethod/fulfilled': [fetchCurrentSubscription],
  'subscription/removePaymentMethod/fulfilled': [fetchCurrentSubscription],
  
  // Department updates trigger departments and teams refresh
  'department/create/fulfilled': [fetchDepartments],
  'department/update/fulfilled': [fetchDepartments],
  'department/delete/fulfilled': [fetchDepartments],
  'department/move/fulfilled': [fetchDepartments],
  
  // Team updates trigger teams refresh
  'team/create/fulfilled': [fetchTeams],
  'team/update/fulfilled': [fetchTeams],
  'team/delete/fulfilled': [fetchTeams],
  'team/addMember/fulfilled': [fetchTeams],
  'team/removeMember/fulfilled': [fetchTeams],
  
  // Position updates trigger positions refresh
  'position/create/fulfilled': [fetchPositions],
  'position/update/fulfilled': [fetchPositions],
  'position/delete/fulfilled': [fetchPositions],
  'position/updateReportingTo/fulfilled': [fetchPositions],
  
  // Branding updates trigger branding refresh
  'branding/update/fulfilled': [fetchBranding],
  'branding/uploadLogo/fulfilled': [fetchBranding],
  'branding/removeLogo/fulfilled': [fetchBranding],
  
  // KPI updates trigger dashboard refresh
  'kpi/create/fulfilled': [fetchKpiOverview],
  'kpi/update/fulfilled': [fetchKpiOverview],
  'kpi/delete/fulfilled': [fetchKpiOverview],
  'kpi/submitActual/fulfilled': [fetchKpiOverview],
  'kpi/approve/fulfilled': [fetchKpiOverview],
  'kpi/reject/fulfilled': [fetchKpiOverview],
};

// Debounce map to prevent multiple rapid refreshes
const pendingRefreshes = new Map();

export const syncMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const actionType = action.type;
  const actionsToDispatch = SYNC_ACTIONS[actionType];
  
  if (actionsToDispatch && actionsToDispatch.length) {
    actionsToDispatch.forEach(asyncAction => {
      const actionKey = asyncAction.name;
      
      // Debounce: Clear existing timeout for this action
      if (pendingRefreshes.has(actionKey)) {
        clearTimeout(pendingRefreshes.get(actionKey));
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        store.dispatch(asyncAction());
        pendingRefreshes.delete(actionKey);
      }, 300); // 300ms debounce
      
      pendingRefreshes.set(actionKey, timeout);
    });
  }
  
  return result;
};