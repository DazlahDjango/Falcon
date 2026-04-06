export const handleMessage = (data, listeners) => {
    const { type, ...payload } = data;
    
    if (!type) {
        console.warn('WebSocket message missing type:', data);
        return;
    }
    if (listeners.has(type)) {
        listeners.get(type).forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error(`Error in ${type} handler:`, error);
            }
        });
    }
    if (listeners.has('message')) {
        listeners.get('message').forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }
};

// Specific Message Handlers
// ===========================
export const handleNotification = (notification) => {
    if (Notification.permission === 'granted') {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
        });
    }
    window.dispatchEvent(new CustomEvent('notification:received', {
        detail: notification
    }));
};
export const handlePresence = (presence) => {
    window.dispatchEvent(new CustomEvent('presence:update', {
        detail: presence
    }));
};
export const handleTyping = (typing) => {
    window.dispatchEvent(new CustomEvent('typing:update', {
        detail: typing
    }));
};
export const handleSystemAlert = (alert) => {
    window.dispatchEvent(new CustomEvent('system:alert', {
        detail: alert
    }));
};
export const handleKpiUpdate = (kpiUpdate) => {
    window.dispatchEvent(new CustomEvent('kpi:update', {
        detail: kpiUpdate
    }));
};
export const handleReviewNotification = (review) => {
    window.dispatchEvent(new CustomEvent('review:notification', {
        detail: review
    }));
};