const THROTTLE_LIMITS = {
  DASHBOARD_VIEW: { limit: 60, window: 60 * 1000 },
  EXPORT: { limit: 20, window: 60 * 60 * 1000 },
  REFRESH: { limit: 10, window: 60 * 1000 },
  WIDGET_CONFIG: { limit: 30, window: 60 * 1000 },
  ALERT_CONFIG: { limit: 20, window: 60 * 1000 },
  COMPARISON_CALC: { limit: 15, window: 60 * 1000 }
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
  
  if (action.type === 'dashboard/fetchExecutiveDashboard/pending' ||
      action.type === 'dashboard/fetchClientAdminDashboard/pending' ||
      action.type === 'dashboard/fetchSuperAdminDashboard/pending') {
    throttleAction = 'DASHBOARD_VIEW';
  }
  
  if (action.type === 'dashboard/refreshAllDashboards/pending') {
    throttleAction = 'REFRESH';
  }
  
  if (action.type === 'dashboardExports/triggerExport/pending') {
    throttleAction = 'EXPORT';
  }
  
  if (action.type === 'dashboardConfig/createWidget/pending' ||
      action.type === 'dashboardConfig/updateWidget/pending' ||
      action.type === 'dashboardConfig/bulkUpdateWidgets/pending') {
    throttleAction = 'WIDGET_CONFIG';
  }
  
  if (action.type === 'dashboardAlerts/createAlert/pending' ||
      action.type === 'dashboardAlerts/updateAlert/pending') {
    throttleAction = 'ALERT_CONFIG';
  }
  
  if (action.type === 'dashboardComparisons/calculateComparison/pending') {
    throttleAction = 'COMPARISON_CALC';
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