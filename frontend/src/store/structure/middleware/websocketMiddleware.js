import { structureWebSocketService } from '../../../services/structure/structureWebSocket.service';

export const structureWebsocketMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'structure/initializeWebSocket' && action.payload?.tenantId) {
    structureWebSocketService.connect(action.payload.tenantId).catch(err => {
      console.error('[StructureWSMiddleware] Connection error:', err);
    });

    structureWebSocketService.addEventListener('org_event', (data) => {
      store.dispatch({ type: 'structure/orgEventReceived', payload: data });
    });

    structureWebSocketService.addEventListener('department_change', (data) => {
      store.dispatch({ type: 'department/departmentUpdated', payload: data });
    });

    structureWebSocketService.addEventListener('team_change', (data) => {
      store.dispatch({ type: 'team/teamUpdated', payload: data });
    });

    structureWebSocketService.addEventListener('reporting_change', (data) => {
      store.dispatch({ type: 'reportingLine/reportingLineUpdated', payload: data });
    });
  }

  if (action.type === 'structure/closeWebSocket') {
    structureWebSocketService.disconnect();
  }

  return result;
};
