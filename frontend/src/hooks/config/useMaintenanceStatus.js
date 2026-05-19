import { useConfigWebSocket } from './useConfigWebSocket';
import { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/config';

export const useMaintenanceStatus = (tenantId = null) => {
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState(null);
  const [affectedApps, setAffectedApps] = useState([]);
  const [activeWindows, setActiveWindows] = useState([]);

  const handleMessage = (data) => {
    if (data.type === 'status_update' || data.type === 'maintenance_update') {
      setMaintenanceActive(data.maintenance_active);
      setMaintenanceType(data.maintenance_type);
      setMaintenanceMessage(data.message);
      setAffectedApps(data.affected_apps || []);
    }
  };

  const { isConnected } = useConfigWebSocket('maintenance', tenantId || 'system', handleMessage);

  const fetchActiveWindows = async () => {
    try {
      const response = await maintenanceService.list({ status: 'in_progress' });
      if (response.success) {
        setActiveWindows(response.data);
      }
    } catch (error) {
      console.error('[useMaintenanceStatus] Failed to fetch active windows:', error);
    }
  };

  useEffect(() => {
    fetchActiveWindows();
    const interval = setInterval(fetchActiveWindows, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAppAffected = (appName) => {
    if (maintenanceType === 'full') return true;
    if (maintenanceType === 'partial') return affectedApps.includes(appName);
    return false;
  };

  return {
    maintenanceActive,
    maintenanceType,
    maintenanceMessage,
    affectedApps,
    activeWindows,
    isConnected,
    isAppAffected,
    refresh: fetchActiveWindows
  };
};