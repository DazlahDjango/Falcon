import React, { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react';
import { configWebSocketService } from '../../services/config';
import { getTenantId } from '../../services/accounts/storage/secureStorage';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [connections, setConnections] = useState({
    maintenance: false,
    backup: false,
    dr: false
  });
  const [lastMessages, setLastMessages] = useState({});
  const listenersRef = useRef(new Map());

  const connectMaintenance = useCallback(async (onMessage) => {
    const tenantId = await getTenantId();
    if (!tenantId) return null;
    
    const id = `maintenance_${tenantId}`;
    if (listenersRef.current.has(id)) {
      listenersRef.current.get(id).add(onMessage);
      return id;
    }
    
    listenersRef.current.set(id, new Set([onMessage]));
    configWebSocketService.connectMaintenance(tenantId, (data) => {
      setLastMessages(prev => ({ ...prev, [id]: data }));
      listenersRef.current.get(id)?.forEach(listener => listener(data));
    });
    setConnections(prev => ({ ...prev, maintenance: true }));
    return id;
  }, []);

  const connectBackup = useCallback(async (backupJobId, onMessage) => {
    const id = `backup_${backupJobId}`;
    if (listenersRef.current.has(id)) {
      listenersRef.current.get(id).add(onMessage);
      return id;
    }
    
    listenersRef.current.set(id, new Set([onMessage]));
    configWebSocketService.connectBackupProgress(backupJobId, (data) => {
      setLastMessages(prev => ({ ...prev, [id]: data }));
      listenersRef.current.get(id)?.forEach(listener => listener(data));
      if (data.status === 'completed' || data.status === 'failed') {
        setTimeout(() => disconnect(id), 5000);
      }
    });
    setConnections(prev => ({ ...prev, backup: true }));
    return id;
  }, []);

  const connectDR = useCallback(async (executionId, onMessage) => {
    const id = `dr_${executionId}`;
    if (listenersRef.current.has(id)) {
      listenersRef.current.get(id).add(onMessage);
      return id;
    }
    
    listenersRef.current.set(id, new Set([onMessage]));
    configWebSocketService.connectDRProgress(executionId, (data) => {
      setLastMessages(prev => ({ ...prev, [id]: data }));
      listenersRef.current.get(id)?.forEach(listener => listener(data));
      if (data.status === 'success' || data.status === 'failed') {
        setTimeout(() => disconnect(id), 5000);
      }
    });
    setConnections(prev => ({ ...prev, dr: true }));
    return id;
  }, []);

  const disconnect = useCallback((id) => {
    configWebSocketService.disconnect(id);
    listenersRef.current.delete(id);
    setLastMessages(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    
    if (id.startsWith('maintenance')) setConnections(prev => ({ ...prev, maintenance: false }));
    else if (id.startsWith('backup')) setConnections(prev => ({ ...prev, backup: false }));
    else if (id.startsWith('dr')) setConnections(prev => ({ ...prev, dr: false }));
  }, []);

  const disconnectAll = useCallback(() => {
    configWebSocketService.disconnectAll();
    listenersRef.current.clear();
    setLastMessages({});
    setConnections({ maintenance: false, backup: false, dr: false });
  }, []);

  const addListener = useCallback((id, listener) => {
    if (listenersRef.current.has(id)) {
      listenersRef.current.get(id).add(listener);
    } else {
      listenersRef.current.set(id, new Set([listener]));
    }
  }, []);

  const removeListener = useCallback((id, listener) => {
    if (listenersRef.current.has(id)) {
      listenersRef.current.get(id).delete(listener);
      if (listenersRef.current.get(id).size === 0) {
        disconnect(id);
      }
    }
  }, [disconnect]);

  const getLastMessage = useCallback((id) => {
    return lastMessages[id];
  }, [lastMessages]);

  const isConnected = useCallback((id) => {
    return configWebSocketService.isConnected(id);
  }, []);

  useEffect(() => {
    return () => {
      disconnectAll();
    };
  }, [disconnectAll]);

  const value = {
    connections,
    connectMaintenance,
    connectBackup,
    connectDR,
    disconnect,
    disconnectAll,
    addListener,
    removeListener,
    getLastMessage,
    isConnected
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};