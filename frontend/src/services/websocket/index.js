export { default as websocketService } from './websocket.service';
export { default as kpiWebSocket } from './kpi.websocket';

// Domain-specific WebSocket service exports
export { default as wsClient, authWsClient } from '../accounts/websocket/client';
export { billingWebSocketService } from '../billing/websocket.service';
export { configWebSocketService } from '../config/websocket.service';
export { dashboardWebSocket } from '../dashboard/websocket.service';
export { structureWebSocketService } from '../structure/structureWebSocket.service';
export { default as tenantWebSocketService } from '../tenant/websocket.service';
export { reportsWebSocketService } from '../reports/websocket.service';
export { reviewsWebSocketService } from '../reviews/websocket.service';