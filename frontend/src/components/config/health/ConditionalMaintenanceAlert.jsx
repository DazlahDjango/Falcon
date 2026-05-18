import { useState, useEffect } from 'react';
import { useHealthCheck } from '../../../hooks/config';
import { useConfigPermissions } from '../../../hooks/config';
import { FiAlertTriangle, FiSettings, FiX, FiClock, FiCheckCircle } from 'react-icons/fi';

export const ConditionalMaintenanceAlert = ({ className = '' }) => {
  const { evaluateThresholds, triggerConditionalMaintenance } = useHealthCheck();
  const { isSuperAdmin } = useConfigPermissions();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const checkHealthThresholds = async () => {
    setIsLoading(true);
    try {
      const apps = ['accounts', 'kpi', 'billing', 'tenant', 'structure', 'reviews', 'dashboard'];
      const results = await Promise.all(apps.map(async (app) => {
        try {
          const result = await evaluateThresholds.mutateAsync(app);
          return { app, ...result.data };
        } catch {
          return null;
        }
      }));
      const unhealthyAlerts = results.filter(r => r && !r.healthy).map(r => ({
        app: r.app,
        reason: r.alerts?.map(a => a.message).join(', ') || 'Health check failed',
        severity: r.alerts?.some(a => a.type === 'critical') ? 'critical' : 'warning'
      }));
      setAlerts(unhealthyAlerts);
    } catch (error) {
      console.error('Failed to check health thresholds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerMaintenance = async () => {
    if (!confirm('Trigger conditional maintenance for unhealthy apps? This will schedule maintenance windows.')) return;
    setIsTriggering(true);
    try {
      await triggerConditionalMaintenance.mutateAsync();
      alert('Conditional maintenance triggered successfully');
      setAlerts([]);
    } catch (error) {
      console.error('Failed to trigger maintenance:', error);
      alert('Failed to trigger maintenance: ' + error.message);
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    checkHealthThresholds();
    const interval = setInterval(checkHealthThresholds, 300000);
    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-full"><FiAlertTriangle className="text-yellow-600 text-xl" /></div>
          <div>
            <h3 className="font-semibold text-yellow-800">Conditional Maintenance Required</h3>
            <p className="text-sm text-yellow-700 mt-1">The following apps have exceeded health thresholds and may require maintenance:</p>
            <div className="mt-3 space-y-2">
              {alerts.map(alert => (
                <div key={alert.app} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span className="font-medium text-gray-800">{alert.app}:</span>
                  <span className="text-gray-600">{alert.reason}</span>
                </div>
              ))}
            </div>
            {isSuperAdmin && (
              <div className="mt-4 flex gap-3">
                <button onClick={handleTriggerMaintenance} disabled={isTriggering} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50">
                  {isTriggering ? <FiClock className="animate-spin" /> : <FiSettings />}
                  Trigger Maintenance
                </button>
                <button onClick={checkHealthThresholds} disabled={isLoading} className="px-3 py-1.5 text-sm border border-yellow-300 rounded-lg hover:bg-yellow-100">
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setAlerts([])} className="p-1 hover:bg-yellow-100 rounded-lg"><FiX className="text-yellow-600" /></button>
      </div>
    </div>
  );
};