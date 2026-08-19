import kpiWebSocket from '../../../services/websocket/kpi.websocket';

export const kpiWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'kpi/initializeWebSocket' && action.payload?.userId) {
    const { userId } = action.payload;
    
    kpiWebSocket.connectDashboard(userId, (data) => {
      store.dispatch({ type: 'kpi/dashboardUpdated', payload: data });
    });

    kpiWebSocket.connectScores(userId, (data) => {
      store.dispatch({ type: 'score/scoreUpdated', payload: data });
    });

    kpiWebSocket.connectNotifications(userId, (data) => {
      store.dispatch({ type: 'kpi/notificationReceived', payload: data });
    });
  }

  if (action.type === 'kpi/closeWebSocket' && action.payload?.userId) {
    const { userId } = action.payload;
    kpiWebSocket.disconnectDashboard(userId);
    kpiWebSocket.disconnectScores(userId);
    kpiWebSocket.disconnectNotifications(userId);
  }

  return result;
};
