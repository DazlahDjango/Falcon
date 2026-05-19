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

// ========== WebSocket Connection State ==========
let socket = null;
let reconnectAttempts = 0;
let reconnectTimeout = null;
let currentCycleId = null;
let currentUserId = null;

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 30000; // 30 seconds

// ========== WebSocket URL Builder ==========
const getWebSocketUrl = (type, cycleId = null) => {
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    switch (type) {
        case 'notifications':
            return `${wsBaseUrl}/ws/reviews/notifications/`;
        case 'review_status':
            return `${wsBaseUrl}/ws/reviews/status/${cycleId}/`;
        case 'calibration':
            return `${wsBaseUrl}/ws/reviews/calibration/${cycleId}/`;
        default:
            return `${wsBaseUrl}/ws/reviews/notifications/`;
    }
};

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
export const connectWebSocket = (store, type = 'notifications', id = null) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
    }
    
    if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket connecting, please wait');
        return;
    }
    
    const url = getWebSocketUrl(type, id);
    socket = new WebSocket(url);
    
    socket.onopen = () => {
        console.log(`WebSocket connected to ${type}`);
        reconnectAttempts = 0;
        
        // Send authentication
        const token = localStorage.getItem('access_token');
        if (token && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'auth',
                token: token,
            }));
        }
        
        // Start ping interval
        if (window.pingInterval) clearInterval(window.pingInterval);
        window.pingInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, PING_INTERVAL);
        
        // Dispatch connection event
        processMessage(store, { type: 'connected' });
    };
    
    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            processMessage(store, data);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    };
    
    socket.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
        
        // Clear ping interval
        if (window.pingInterval) {
            clearInterval(window.pingInterval);
            window.pingInterval = null;
        }
        
        // Attempt reconnection
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(() => {
                reconnectAttempts++;
                console.log(`Reconnecting WebSocket... Attempt ${reconnectAttempts}`);
                connectWebSocket(store, type, id);
            }, RECONNECT_DELAY * reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            processMessage(store, {
                type: 'error',
                message: 'Unable to connect to real-time server',
            });
        }
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        processMessage(store, {
            type: 'error',
            message: 'WebSocket connection error',
        });
    };
};

// ========== Disconnect WebSocket ==========
export const disconnectWebSocket = () => {
    if (window.pingInterval) {
        clearInterval(window.pingInterval);
        window.pingInterval = null;
    }
    
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    
    if (socket) {
        socket.close();
        socket = null;
    }
    
    reconnectAttempts = 0;
    console.log('WebSocket disconnected');
};

// ========== Send Message through WebSocket ==========
export const sendWebSocketMessage = (data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        return true;
    }
    return false;
};

// ========== Subscribe to Review Cycle Updates ==========
export const subscribeToCycle = (cycleId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'subscribe_cycle',
            cycle_id: cycleId,
        }));
        currentCycleId = cycleId;
        return true;
    }
    return false;
};

// ========== Unsubscribe from Review Cycle Updates ==========
export const unsubscribeFromCycle = () => {
    if (socket && socket.readyState === WebSocket.OPEN && currentCycleId) {
        socket.send(JSON.stringify({
            type: 'unsubscribe_cycle',
            cycle_id: currentCycleId,
        }));
        currentCycleId = null;
        return true;
    }
    return false;
};

// ========== Join Calibration Session ==========
export const joinCalibrationSession = (sessionId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'join_session',
            session_id: sessionId,
        }));
        return true;
    }
    return false;
};

// ========== Leave Calibration Session ==========
export const leaveCalibrationSession = (sessionId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'leave_session',
            session_id: sessionId,
        }));
        return true;
    }
    return false;
};

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