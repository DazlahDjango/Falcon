import { useEffect, useCallback, useState, useRef } from 'react';
import reviewsWebSocketService from '../../services/reviews/websocket.service';

export const useReviewsWebSocket = (options = {}) => {
  const {
    autoConnect = true,
    cycleId = null,
    sessionId = null,
    channel = 'notifications',
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectingRef.current || isConnectedRef.current) return;
    isConnectingRef.current = true;

    const handleMsg = (data) => {
      setLastMessage(data);
      optionsRef.current.onMessage?.(data);
    };

    const handleError = (err) => {
      isConnectingRef.current = false;
      optionsRef.current.onError?.(err);
    };

    const handleConnectSuccess = () => {
      isConnectedRef.current = true;
      isConnectingRef.current = false;
      setIsConnected(true);
    };

    if (channel === 'status' && cycleId) {
      reviewsWebSocketService.connectStatus(cycleId, handleMsg, handleError).then(handleConnectSuccess);
    } else if (channel === 'calibration' && sessionId) {
      reviewsWebSocketService.connectCalibration(sessionId, handleMsg, handleError).then(handleConnectSuccess);
    } else if (channel === 'dashboard') {
      reviewsWebSocketService.connectDashboard(handleMsg, handleError).then(handleConnectSuccess);
    } else {
      reviewsWebSocketService.connectNotifications(handleMsg, handleError).then(handleConnectSuccess);
    }
  }, [channel, cycleId, sessionId]);

  const disconnect = useCallback(() => {
    if (channel === 'status' && cycleId) {
      reviewsWebSocketService.disconnectStatus(cycleId);
    } else if (channel === 'calibration' && sessionId) {
      reviewsWebSocketService.disconnectCalibration(sessionId);
    } else if (channel === 'dashboard') {
      reviewsWebSocketService.disconnectDashboard();
    } else {
      reviewsWebSocketService.disconnectNotifications();
    }
    isConnectedRef.current = false;
    isConnectingRef.current = false;
    setIsConnected(false);
  }, [channel, cycleId, sessionId]);

  const send = useCallback((message) => {
    const key = channel === 'status' ? `reviews_status_${cycleId}` : channel === 'calibration' ? `reviews_calibration_${sessionId}` : channel === 'dashboard' ? 'reviews_dashboard' : 'reviews_notifications';
    return reviewsWebSocketService.send(key, message);
  }, [channel, cycleId, sessionId]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    send,
  };
};

export default useReviewsWebSocket;