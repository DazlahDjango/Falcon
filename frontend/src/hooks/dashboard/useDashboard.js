import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { dashboardWebSocket } from '../../services/dashboard/websocket.service';

export const useDashboard = (dashboardType, options = {}) => {
  const {
    enableWebSocket = true,
    onDataUpdate = null,
    onError = null
  } = options;

  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const handleError = useCallback((err) => {
    if (!isMountedRef.current) return;
    setError(err);
    setLoading(false);
    if (onError) onError(err);
  }, [onError]);

  const handleDataUpdate = useCallback((newData) => {
    if (!isMountedRef.current) return;
    setData(newData);
    setLoading(false);
    setError(null);
    if (onDataUpdate) onDataUpdate(newData);
  }, [onDataUpdate]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enableWebSocket && dashboardWebSocket && dashboardType) {
      dashboardWebSocket.connect(
        dashboardType,
        (message) => {
          if (message.type === 'update' || message.type === 'initial') {
            handleDataUpdate(message.data);
          }
          if (options.onWebsocketMessage) {
            options.onWebsocketMessage(message);
          }
        },
        handleError,
        () => setLoading(false)
      );
    }

    return () => {
      isMountedRef.current = false;
      if (enableWebSocket && dashboardWebSocket) {
        dashboardWebSocket.disconnect();
      }
    };
  }, [dashboardType, enableWebSocket, handleDataUpdate, handleError, options]);

  const refresh = useCallback(() => {
    return dashboardWebSocket.refresh();
  }, []);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export default useDashboard;