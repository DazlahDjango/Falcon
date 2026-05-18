import { useEffect, useRef, useCallback, useState } from 'react';
import { configWebSocketService } from '../../services/config';

export const useConfigWebSocket = (type, identifier, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const messageHandlerRef = useRef(onMessage);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let ws = null;
    let connectionId = null;

    const handleMessage = (data) => {
      setLastMessage(data);
      if (messageHandlerRef.current) {
        messageHandlerRef.current(data);
      }
    };

    const handleError = (error) => {
      console.error(`[ConfigWS] ${type} error:`, error);
      setIsConnected(false);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    if (type === 'maintenance' && identifier) {
      connectionId = `maintenance_${identifier}`;
      ws = configWebSocketService.connectMaintenance(identifier, handleMessage, handleError, handleClose);
    } else if (type === 'backup' && identifier) {
      connectionId = `backup_${identifier}`;
      ws = configWebSocketService.connectBackupProgress(identifier, handleMessage, handleError, handleClose);
    } else if (type === 'dr' && identifier) {
      connectionId = `dr_${identifier}`;
      ws = configWebSocketService.connectDRProgress(identifier, handleMessage, handleError, handleClose);
    }

    if (ws) {
      const checkConnection = setInterval(() => {
        setIsConnected(configWebSocketService.isConnected(connectionId));
      }, 1000);
      return () => {
        clearInterval(checkConnection);
        if (connectionId) {
          configWebSocketService.disconnect(connectionId);
        }
      };
    }
  }, [type, identifier]);

  const sendMessage = useCallback((data) => {
    const connectionId = type === 'maintenance' ? `maintenance_${identifier}` : type === 'backup' ? `backup_${identifier}` : `dr_${identifier}`;
    const ws = configWebSocketService.sockets?.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [type, identifier]);

  return { isConnected, lastMessage, sendMessage };
};