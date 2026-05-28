import { useCallback, useContext, useEffect } from 'react';
import DashboardRealtimeContext from '../../contexts/dashboard/DashboardRealtimeContext';

/**
 * Page-level hook: realtime channel + manual refresh (no duplicate WebSocket when provider is active).
 */
export const useDashboardPage = ({
  dashboardType,
  onRealtimeMessage,
  onRefresh,
} = {}) => {
  const realtimeCtx = useContext(DashboardRealtimeContext);

  const connected = realtimeCtx?.connected ?? false;
  const refresh = useCallback(() => {
    realtimeCtx?.refresh?.();
    onRefresh?.();
  }, [realtimeCtx, onRefresh]);

  useEffect(() => {
    if (!dashboardType || !onRealtimeMessage || !realtimeCtx?.registerHandler) {
      return undefined;
    }
    return realtimeCtx.registerHandler(dashboardType, onRealtimeMessage);
  }, [dashboardType, onRealtimeMessage, realtimeCtx]);

  return {
    connected,
    refresh,
    lastEvent: realtimeCtx?.lastEvent ?? null,
    isRefreshing: false,
  };
};

export default useDashboardPage;
