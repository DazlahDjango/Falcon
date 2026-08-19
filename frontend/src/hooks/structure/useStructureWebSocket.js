import { useEffect, useState, useCallback } from 'react';
import { structureWebSocketService } from '../../services/structure/structureWebSocket.service';
import { useAuth } from '../accounts/useAuth';

export const useStructureWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      structureWebSocketService.connect(user.tenantId);
      setIsConnected(structureWebSocketService.isConnected());
    }
  }, [isAuthenticated, user?.tenantId]);

  const subscribeToDepartment = useCallback((departmentId) => {
    structureWebSocketService.subscribeToDepartment(departmentId);
  }, []);

  const subscribeToTeam = useCallback((teamId) => {
    structureWebSocketService.subscribeToTeam(teamId);
  }, []);

  const addEventListener = useCallback((eventType, callback) => {
    structureWebSocketService.addEventListener(eventType, callback);
    return () => structureWebSocketService.removeEventListener(eventType, callback);
  }, []);

  return {
    isConnected,
    subscribeToDepartment,
    subscribeToTeam,
    addEventListener,
  };
};

export const useStructureEvent = (eventType, onEvent) => {
  const { addEventListener } = useStructureWebSocket();
  useEffect(() => {
    if (!onEvent) return;
    const unsubscribe = addEventListener(eventType, onEvent);
    return unsubscribe;
  }, [eventType, onEvent, addEventListener]);
};

export default useStructureWebSocket;