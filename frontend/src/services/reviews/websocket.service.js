import { websocketService } from '../websocket';
import { getAccessToken } from '../accounts/storage/secureStorage';
import { REVIEWS_WS } from '../../config/constants/websocketApiConstants';

class ReviewsWebSocketService {
  constructor() {
    this.connections = {
      status: null,
      calibration: null,
      notifications: null,
      dashboard: null
    };
  }

  async connectStatus(cycleId, onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = `reviews_status_${cycleId}`;
    const endpoint = REVIEWS_WS.STATUS(cycleId);
    this.connections.status = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.status;
  }

  disconnectStatus(cycleId) {
    const key = `reviews_status_${cycleId}`;
    websocketService.disconnect(key);
    this.connections.status = null;
  }

  async connectCalibration(sessionId, onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = `reviews_calibration_${sessionId}`;
    const endpoint = REVIEWS_WS.CALIBRATION(sessionId);
    this.connections.calibration = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.calibration;
  }

  disconnectCalibration(sessionId) {
    const key = `reviews_calibration_${sessionId}`;
    websocketService.disconnect(key);
    this.connections.calibration = null;
  }

  async connectNotifications(onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = 'reviews_notifications';
    const endpoint = REVIEWS_WS.NOTIFICATIONS;
    this.connections.notifications = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.notifications;
  }

  disconnectNotifications() {
    websocketService.disconnect('reviews_notifications');
    this.connections.notifications = null;
  }

  async connectDashboard(onMessage, onError = null) {
    const token = await getAccessToken();
    if (token) websocketService.setAuthToken(token);
    const key = 'reviews_dashboard';
    const endpoint = REVIEWS_WS.DASHBOARD;
    this.connections.dashboard = websocketService.connect(key, endpoint, onMessage, null, onError);
    return this.connections.dashboard;
  }

  disconnectDashboard() {
    websocketService.disconnect('reviews_dashboard');
    this.connections.dashboard = null;
  }

  send(key, message) {
    return websocketService.send(key, message);
  }

  disconnectAll() {
    websocketService.disconnectAll();
    this.connections = { status: null, calibration: null, notifications: null, dashboard: null };
  }
}

export const reviewsWebSocketService = new ReviewsWebSocketService();
export default reviewsWebSocketService;
