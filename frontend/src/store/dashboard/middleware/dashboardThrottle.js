// frontend/src/store/dashboard/middleware/dashboardThrottle.js

const THROTTLE_LIMITS = {
  DASHBOARD_VIEW: { limit: 60, window: 60 * 1000 },
  EXPORT: { limit: 20, window: 60 * 60 * 1000 },
  REFRESH: { limit: 10, window: 60 * 1000 },
  WIDGET_CONFIG: { limit: 30, window: 60 * 1000 },
  ALERT_CONFIG: { limit: 20, window: 60 * 1000 },
  COMPARISON_CALC: { limit: 15, window: 60 * 1000 },
  // ===== ADD NEW THROTTLE TYPES =====
  SUBMISSION: { limit: 30, window: 60 * 1000 },      // KPI submissions
  APPROVAL: { limit: 50, window: 60 * 1000 },        // Approve/Reject actions
  CONFIG_UPDATE: { limit: 20, window: 60 * 1000 },   // Champion config updates
  DRILL_DOWN: { limit: 30, window: 60 * 1000 }       // Drill-down operations
};

const requestLogs = new Map();

const getThrottleKey = (userId, actionType) => `${userId}_${actionType}`;

const cleanExpiredLogs = () => {
  const now = Date.now();
  for (const [key, logs] of requestLogs.entries()) {
    const validLogs = logs.filter(log => log.timestamp > now - log.window);
    if (validLogs.length === 0) {
      requestLogs.delete(key);
    } else {
      requestLogs.set(key, validLogs);
    }
  }
};

const isThrottled = (userId, actionType) => {
  const limits = THROTTLE_LIMITS[actionType];
  if (!limits) return false;

  const key = getThrottleKey(userId, actionType);
  const now = Date.now();
  const existingLogs = requestLogs.get(key) || [];
  
  const validLogs = existingLogs.filter(log => log.timestamp > now - limits.window);
  const count = validLogs.length;
  
  if (count >= limits.limit) {
    const oldestLog = validLogs[0];
    const timeUntilReset = (oldestLog.timestamp + limits.window) - now;
    return { isThrottled: true, timeUntilReset, limit: limits.limit, count };
  }
  
  return { isThrottled: false, remaining: limits.limit - count, limit: limits.limit };
};

const recordRequest = (userId, actionType) => {
  const limits = THROTTLE_LIMITS[actionType];
  if (!limits) return;
  
  const key = getThrottleKey(userId, actionType);
  const existingLogs = requestLogs.get(key) || [];
  const now = Date.now();
  
  const validLogs = existingLogs.filter(log => log.timestamp > now - limits.window);
  validLogs.push({ timestamp: now, window: limits.window });
  
  requestLogs.set(key, validLogs);
  
  setTimeout(cleanExpiredLogs, 60000);
};

export const dashboardThrottleMiddleware = (store) => (next) => (action) => {
  const state = store.getState();
  const userId = state.auth?.user?.id;
  
  if (!userId) {
    return next(action);
  }
  
  let throttleAction = null;
  
  // Existing Dashboard Views
  if (action.type === 'dashboard/fetchExecutiveDashboard/pending' ||
      action.type === 'dashboard/fetchClientAdminDashboard/pending' ||
      action.type === 'dashboard/fetchSuperAdminDashboard/pending') {
    throttleAction = 'DASHBOARD_VIEW';
  }
  
  // ===== ADD NEW DASHBOARD VIEWS =====
  if (action.type === 'managerDashboard/fetchData/pending' ||
      action.type === 'staffDashboard/fetchData/pending' ||
      action.type === 'championDashboard/fetchEditable/pending' ||
      action.type === 'readOnlyDashboard/fetchData/pending') {
    throttleAction = 'DASHBOARD_VIEW';
  }
  
  // Existing Refresh
  if (action.type === 'dashboard/refreshAllDashboards/pending') {
    throttleAction = 'REFRESH';
  }
  
  // ===== ADD NEW REFRESH =====
  if (action.type === 'managerDashboard/refreshAll/pending' ||
      action.type === 'staffDashboard/refreshAll/pending' ||
      action.type === 'championDashboard/refreshAll/pending' ||
      action.type === 'readOnlyDashboard/refresh/pending') {
    throttleAction = 'REFRESH';
  }
  
  // Existing Export
  if (action.type === 'dashboardExports/triggerExport/pending') {
    throttleAction = 'EXPORT';
  }
  
  // ===== ADD NEW EXPORTS =====
  if (action.type === 'managerDashboard/export/pending' ||
      action.type === 'staffDashboard/export/pending' ||
      action.type === 'readOnlyDashboard/export/pending') {
    throttleAction = 'EXPORT';
  }
  
  // Existing Widget Config
  if (action.type === 'dashboardConfig/createWidget/pending' ||
      action.type === 'dashboardConfig/updateWidget/pending' ||
      action.type === 'dashboardConfig/bulkUpdateWidgets/pending') {
    throttleAction = 'WIDGET_CONFIG';
  }
  
  // Existing Alert Config
  if (action.type === 'dashboardAlerts/createAlert/pending' ||
      action.type === 'dashboardAlerts/updateAlert/pending') {
    throttleAction = 'ALERT_CONFIG';
  }
  
  // Existing Comparison Calc
  if (action.type === 'dashboardComparisons/calculateComparison/pending') {
    throttleAction = 'COMPARISON_CALC';
  }
  
  // ===== ADD NEW THROTTLES =====
  
  // KPI Submissions
  if (action.type === 'staffDashboard/submitKPI/pending') {
    throttleAction = 'SUBMISSION';
  }
  
  // Approve/Reject Actions
  if (action.type === 'managerDashboard/approveSubmission/pending' ||
      action.type === 'managerDashboard/rejectSubmission/pending') {
    throttleAction = 'APPROVAL';
  }
  
  // Champion Config Updates
  if (action.type === 'championDashboard/updateConfig/pending' ||
      action.type === 'championDashboard/addKPI/pending' ||
      action.type === 'championDashboard/removeKPI/pending' ||
      action.type === 'championDashboard/updateWeights/pending' ||
      action.type === 'championDashboard/updateTargets/pending') {
    throttleAction = 'CONFIG_UPDATE';
  }
  
  // Drill Down
  if (action.type === 'managerDashboard/drillDown/pending') {
    throttleAction = 'DRILL_DOWN';
  }
  
  if (throttleAction) {
    const throttleCheck = isThrottled(userId, throttleAction);
    
    if (throttleCheck.isThrottled) {
      const errorAction = {
        type: action.type.replace('/pending', '/rejected'),
        error: {
          message: `Rate limit exceeded. Please try again in ${Math.ceil(throttleCheck.timeUntilReset / 1000)} seconds.`,
          throttleInfo: throttleCheck
        }
      };
      return store.dispatch(errorAction);
    }
    
    recordRequest(userId, throttleAction);
  }
  
  return next(action);
};

export const getThrottleStatus = (userId, actionType) => {
  return isThrottled(userId, actionType);
};

export const resetThrottleForUser = (userId) => {
  const prefix = `${userId}_`;
  for (const key of requestLogs.keys()) {
    if (key.startsWith(prefix)) {
      requestLogs.delete(key);
    }
  }
};