import { useEffect, useRef, useCallback, useState } from 'react';
import { configWebSocketService } from '../../services/config/websocket.service';

export const useConfigWebSocket = (type, identifier, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const messageHandlerRef = useRef(onMessage);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let connectionId = null;

    const handleMessage = (data) => {
      setLastMessage(data);
      if (messageHandlerRef.current) {
        messageHandlerRef.current(data);
      }
    };

    const handleError = (error) => {
      console.error(`[ConfigWSHook] ${type} error:`, error);
      setIsConnected(false);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    if (type === 'maintenance' && identifier) {
      connectionId = `maintenance_${identifier}`;
      configWebSocketService.connectMaintenance(identifier, handleMessage, handleError, handleClose);
      setIsConnected(true);
    } else if (type === 'backup' && identifier) {
      connectionId = `backup_${identifier}`;
      configWebSocketService.connectBackupProgress(identifier, handleMessage, handleError, handleClose);
      setIsConnected(true);
    } else if (type === 'dr' && identifier) {
      connectionId = `dr_${identifier}`;
      configWebSocketService.connectDRProgress(identifier, handleMessage, handleError, handleClose);
      setIsConnected(true);
    }

    return () => {
      if (connectionId) {
        configWebSocketService.disconnect(connectionId);
        setIsConnected(false);
      }
    };
  }, [type, identifier]);

  const sendMessage = useCallback((data) => {
    const connectionId = type === 'maintenance' ? `maintenance_${identifier}` : type === 'backup' ? `backup_${identifier}` : `dr_${identifier}`;
    return configWebSocketService.send(connectionId, data);
  }, [type, identifier]);

  return { isConnected, lastMessage, sendMessage };
};

export default useConfigWebSocket;