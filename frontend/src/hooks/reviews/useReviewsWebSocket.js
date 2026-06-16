// src/hooks/reviews/useReviewsWebSocket.js
import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { websocketActions } from '../../store/middleware/websocket.middleware';

const useReviewsWebSocket = (options = {}) => {
  const {
    autoConnect = true,
    onMessage,
    onOpen,
    onClose,
    onError,
    channels = ['reviews', 'notifications', 'dashboard'],
  } = options;

  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket
  const connect = useCallback(() => {
    dispatch(websocketActions.connect());
  }, [dispatch]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    dispatch(websocketActions.disconnect());
    setIsConnected(false);
  }, [dispatch]);

  // Send message
  const send = useCallback(
    (payload) => {
      if (!isConnected) {
        console.warn('WebSocket: Cannot send - not connected');
        return false;
      }
      dispatch(websocketActions.send(payload));
      return true;
    },
    [dispatch, isConnected]
  );

  // Subscribe to channels
  const subscribe = useCallback(
    (newChannels) => {
      const channelsToSubscribe = newChannels || channels;
      dispatch(websocketActions.subscribe(channelsToSubscribe));
    },
    [dispatch, channels]
  );

  // Reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 3000);
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
      // Subscribe to channels after connection
      setTimeout(() => subscribe(), 100);
    }

    // Set up connection status listener
    const checkConnection = setInterval(() => {
      // Check if WebSocket is connected via middleware state
      // This would need to be implemented in the middleware
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, subscribe]);

  return {
    connect,
    disconnect,
    reconnect,
    send,
    subscribe,
    isConnected,
    reconnectAttempts: reconnectAttempts.current,
  };
};

export default useReviewsWebSocket;