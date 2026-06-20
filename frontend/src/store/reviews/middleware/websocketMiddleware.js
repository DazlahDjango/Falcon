// src/store/reviews/middleware/websocketMiddleware.js
// WebSocket middleware for real-time updates

import {
    fetchCycleProgress,
    fetchActiveCycle,
    fetchMyCycles,
} from '../slices/cycleSlice';
import {
    fetchReviewQueue,
} from '../slices/supervisorReviewSlice';
import {
    fetchActivePIPs,
    fetchMyPIPs,
} from '../slices/pipSlice';
import {
    fetchPendingFeedbackRequests,
    fetchMyFeedbackSummary,
} from '../slices/feedbackSlice';
import {
    fetchMyCalibrationSessions,
} from '../slices/calibrationSlice';
import {
    addNotification,
    setUnreadCount,
} from '../slices/notificationSlice';

// Use shared websocket service and constants
import { websocketService } from '../../../services/websocket';
import { REVIEWS_WS, websocketBase } from '../../../config/constants/websocketApiConstants';
import { getAccessToken } from '../../../services/accounts/storage/secureStorage';

// ========== WebSocket Connection State ==========
let currentUserId = null;
const connections = new Map();

// ========== WebSocket Message Handlers ==========
const messageHandlers = {
    // Notification handlers
    notification: (store, data) => {
        store.dispatch(addNotification(data));
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted' && data.title) {
            new Notification(data.title, {
                body: data.message,
                icon: '/favicon.ico',
            });
        }
    },
    
    unread_count: (store, data) => {
        store.dispatch(setUnreadCount(data.count));
    },
    
    // Review status handlers
    review_submitted: (store, data) => {
        if (data.cycle_id) {
            store.dispatch(fetchCycleProgress(data.cycle_id));
        }
        store.dispatch(fetchReviewQueue());
        store.dispatch(fetchMyCycles());
    },
    
    review_approved: (store, data) => {
        if (data.cycle_id) {
            store.dispatch(fetchCycleProgress(data.cycle_id));
            store.dispatch(fetchActiveCycle());
        }
        store.dispatch(fetchReviewQueue());
    },
    
    review_rejected: (store, data) => {
        if (data.cycle_id) {
            store.dispatch(fetchCycleProgress(data.cycle_id));
        }
    },
    
    completion_updated: (store, data) => {
        if (data.cycle_id) {
            store.dispatch(fetchCycleProgress(data.cycle_id));
        }
    },
    
    // PIP handlers
    pip_created: (store, data) => {
        store.dispatch(fetchActivePIPs());
        store.dispatch(fetchMyPIPs());
    },
    
    pip_updated: (store, data) => {
        store.dispatch(fetchActivePIPs());
        if (data.employee_id === currentUserId) {
            store.dispatch(fetchMyPIPs());
        }
    },
    
    pip_completed: (store, data) => {
        store.dispatch(fetchActivePIPs());
        store.dispatch(fetchMyPIPs());
    },
    
    pip_escalated: (store, data) => {
        store.dispatch(fetchActivePIPs());
        store.dispatch(addNotification({
            type: 'warning',
            title: 'PIP Escalated',
            message: `PIP for ${data.employee_name} has been escalated`,
        }));
    },
    
    // Feedback handlers
    feedback_requested: (store, data) => {
        store.dispatch(fetchPendingFeedbackRequests());
        store.dispatch(addNotification({
            type: 'info',
            title: 'Feedback Requested',
            message: `You have been asked to provide feedback for ${data.subject_name}`,
        }));
    },
    
    feedback_submitted: (store, data) => {
        store.dispatch(fetchMyFeedbackSummary());
    },
    
    // Calibration handlers
    calibration_adjustment: (store, data) => {
        store.dispatch(addNotification({
            type: 'info',
            title: 'Rating Adjusted',
            message: `${data.employee_name}'s rating adjusted from ${data.before_score} to ${data.after_score}`,
        }));
    },
    
    calibration_session_started: (store, data) => {
        store.dispatch(fetchMyCalibrationSessions());
    },
    
    calibration_session_completed: (store, data) => {
        store.dispatch(fetchMyCalibrationSessions());
    },
    
    calibration_comment: (store, data) => {
        store.dispatch(addNotification({
            type: 'info',
            title: 'New Comment',
            message: `${data.author_name} commented in calibration session`,
        }));
    },
    
    // Connection handlers
    pong: () => {
        // Connection alive
    },
    
    connected: () => {
        console.log('WebSocket connected');
    },
    
    error: (store, data) => {
        console.error('WebSocket error:', data.message);
    },
};

// ========== Process Incoming Message ==========
const processMessage = (store, data) => {
    const handler = messageHandlers[data.type];
    if (handler) {
        handler(store, data);
    } else {
        console.log('Unhandled WebSocket message type:', data.type);
    }
};

// ========== WebSocket Connection Management ==========
export const connectWebSocket = async (store, type = 'notifications', id = null) => {
    // initialize token-aware base
    const token = await getAccessToken();
    websocketService.init(websocketBase, token);

    const key = type === 'notifications' ? 'reviews_notifications' : type === 'review_status' ? `reviews_status_${id}` : `reviews_calibration_${id}`;
    if (connections.has(key) && websocketService.isConnected(key)) return;

    const endpoint = type === 'notifications' ? REVIEWS_WS.NOTIFICATIONS : type === 'review_status' ? REVIEWS_WS.STATUS(id) : REVIEWS_WS.CALIBRATION(id);

    websocketService.connect(
        key,
        endpoint,
        (data) => processMessage(store, data),
        () => processMessage(store, { type: 'connected' }),
        (error) => processMessage(store, { type: 'error', message: error?.message || 'WebSocket error' }),
        () => {
            // onClose handled by service reconnection logic
        }
    );

    connections.set(key, true);
};

// ========== Disconnect WebSocket ==========
export const disconnectWebSocket = () => {
    connections.forEach((_, key) => websocketService.disconnect(key));
    connections.clear();
};

// ========== Send Message through WebSocket ==========
export const sendWebSocketMessage = (key, data) => websocketService.send(key, data);

// ========== Subscribe to Review Cycle Updates ==========
export const subscribeToCycle = (cycleId) => sendWebSocketMessage(`reviews_status_${cycleId}`, { type: 'subscribe_cycle', cycle_id: cycleId });

// ========== Unsubscribe from Review Cycle Updates ==========
export const unsubscribeFromCycle = (cycleId) => sendWebSocketMessage(`reviews_status_${cycleId}`, { type: 'unsubscribe_cycle', cycle_id: cycleId });

// ========== Join Calibration Session ==========
export const joinCalibrationSession = (sessionId) => sendWebSocketMessage(`reviews_calibration_${sessionId}`, { type: 'join_session', session_id: sessionId });

// ========== Leave Calibration Session ==========
export const leaveCalibrationSession = (sessionId) => sendWebSocketMessage(`reviews_calibration_${sessionId}`, { type: 'leave_session', session_id: sessionId });

// ========== WebSocket Middleware ==========
export const websocketMiddleware = (store) => (next) => (action) => {
    // Handle WebSocket connection actions
    if (action.type === 'reviews/websocket/connect') {
        const { type, id } = action.payload || {};
        connectWebSocket(store, type || 'notifications', id);
    }
    
    if (action.type === 'reviews/websocket/disconnect') {
        disconnectWebSocket();
    }
    
    if (action.type === 'reviews/websocket/send') {
        sendWebSocketMessage(action.payload);
    }
    
    if (action.type === 'reviews/websocket/subscribeCycle') {
        subscribeToCycle(action.payload);
    }
    
    if (action.type === 'reviews/websocket/unsubscribeCycle') {
        unsubscribeFromCycle();
    }
    
    if (action.type === 'reviews/websocket/joinCalibration') {
        joinCalibrationSession(action.payload);
    }
    
    if (action.type === 'reviews/websocket/leaveCalibration') {
        leaveCalibrationSession(action.payload);
    }
    
    return next(action);
};

// ========== Action Creators for WebSocket ==========
export const connectWebSocketAction = (type = 'notifications', id = null) => ({
    type: 'reviews/websocket/connect',
    payload: { type, id },
});

export const disconnectWebSocketAction = () => ({
    type: 'reviews/websocket/disconnect',
});

export const sendWebSocketMessageAction = (data) => ({
    type: 'reviews/websocket/send',
    payload: data,
});

export const subscribeToCycleAction = (cycleId) => ({
    type: 'reviews/websocket/subscribeCycle',
    payload: cycleId,
});

export const unsubscribeFromCycleAction = () => ({
    type: 'reviews/websocket/unsubscribeCycle',
});

export const joinCalibrationSessionAction = (sessionId) => ({
    type: 'reviews/websocket/joinCalibration',
    payload: sessionId,
});

export const leaveCalibrationSessionAction = (sessionId) => ({
    type: 'reviews/websocket/leaveCalibration',
    payload: sessionId,
});