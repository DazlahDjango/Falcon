import { useEffect, useState, useCallback, useRef } from 'react';
import { structureWebSocketService } from '../../services/structure/structureWebSocket.service';
import { useAuth } from '../accounts/useAuth';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/structure/notificationSlice';

export const useStructureWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const reconnectTimerRef = useRef(null);
  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      structureWebSocketService.connect(user.tenantId);
      const checkConnection = setInterval(() => {
        setIsConnected(structureWebSocketService.isConnected());
      }, 1000);
      return () => {
        clearInterval(checkConnection);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
      };
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
    lastEvent,
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

export const useRealtimeDepartment = (departmentId) => {
  const { subscribeToDepartment, addEventListener } = useStructureWebSocket();
  const [departmentUpdate, setDepartmentUpdate] = useState(null);
  useEffect(() => {
    if (departmentId) {
      subscribeToDepartment(departmentId);
    }
  }, [departmentId, subscribeToDepartment]);
  useEffect(() => {
    const handleDepartmentChange = (event) => {
      if (event.department_id === departmentId) {
        setDepartmentUpdate(event);
      }
    };
    const unsubscribe = addEventListener('department_change', handleDepartmentChange);
    return unsubscribe;
  }, [departmentId, addEventListener]);

  return { departmentUpdate };
};

export const useRealtimeTeam = (teamId) => {
  const { subscribeToTeam, addEventListener } = useStructureWebSocket();
  const [teamUpdate, setTeamUpdate] = useState(null);
  useEffect(() => {
    if (teamId) {
      subscribeToTeam(teamId);
    }
  }, [teamId, subscribeToTeam]);
  useEffect(() => {
    const handleTeamChange = (event) => {
      if (event.team_id === teamId) {
        setTeamUpdate(event);
      }
    };
    const unsubscribe = addEventListener('team_change', handleTeamChange);
    return unsubscribe;
  }, [teamId, addEventListener]);
  return { teamUpdate };
};

export const useRealtimeReportingChain = () => {
  const dispatch = useDispatch();
  const { addEventListener } = useStructureWebSocket();
  const [chainInvalidated, setChainInvalidated] = useState(false);
  useEffect(() => {
    const handleManagerChanged = (event) => {
      dispatch(addNotification({
        type: 'info',
        title: 'Reporting Chain Updated',
        message: event.message || 'Your reporting structure has been updated',
        timestamp: Date.now(),
      }));
      setChainInvalidated(prev => !prev);
    };
    const unsubscribeManager = addEventListener('manager_changed', handleManagerChanged);
    return unsubscribeManager;
  }, [addEventListener, dispatch]);
  return { chainInvalidated };
};

export const useRealtimePermissions = () => {
  const dispatch = useDispatch();
  const { addEventListener } = useStructureWebSocket();
  const [permissionsUpdated, setPermissionsUpdated] = useState(false);
  useEffect(() => {
    const handlePermissionsUpdated = (event) => {
      dispatch(addNotification({
        type: 'warning',
        title: 'Permissions Updated',
        message: 'Your access permissions have been changed',
        timestamp: Date.now(),
      }));
      setPermissionsUpdated(prev => !prev);
    };
    const unsubscribe = addEventListener('permissions_updated', handlePermissionsUpdated);
    return unsubscribe;
  }, [addEventListener, dispatch]);
  return { permissionsUpdated };
};