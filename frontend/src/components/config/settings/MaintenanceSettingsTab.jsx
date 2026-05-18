import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMaintenanceAutoApprove, setHealthCheckInterval } from '../../../store/config/slices/configSettingsSlice';

export const MaintenanceSettingsTab = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.config?.settings);
  const [localSettings, setLocalSettings] = useState({
    auto_approve: settings?.maintenanceAutoApprove ?? false,
    health_check_interval: settings?.healthCheckInterval ?? 300,
    max_concurrent_maintenance: 3,
    default_maintenance_duration: 60,
    notify_before_minutes: [15, 30, 60],
    emergency_maintenance_requires_super_admin: true
  });

  const handleSave = () => {
    dispatch(setMaintenanceAutoApprove(localSettings.auto_approve));
    dispatch(setHealthCheckInterval(localSettings.health_check_interval));
    alert('Maintenance settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><label className="font-medium text-gray-700">Auto-approve Maintenance</label><p className="text-sm text-gray-500">Automatically approve scheduled maintenance windows</p></div>
            <button onClick={() => setLocalSettings({ ...localSettings, auto_approve: !localSettings.auto_approve })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.auto_approve ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.auto_approve ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><label className="font-medium text-gray-700">Emergency Requires Super Admin</label><p className="text-sm text-gray-500">Emergency maintenance requires super admin approval</p></div>
            <button onClick={() => setLocalSettings({ ...localSettings, emergency_maintenance_requires_super_admin: !localSettings.emergency_maintenance_requires_super_admin })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.emergency_maintenance_requires_super_admin ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.emergency_maintenance_requires_super_admin ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Health Check Interval (seconds)</label>
            <input type="number" value={localSettings.health_check_interval} onChange={(e) => setLocalSettings({ ...localSettings, health_check_interval: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="30" max="3600" step="30" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Maintenance Duration (minutes)</label>
            <input type="number" value={localSettings.default_maintenance_duration} onChange={(e) => setLocalSettings({ ...localSettings, default_maintenance_duration: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="15" max="1440" />
          </div>
        </div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Notify Before (minutes)</label>
        <div className="flex gap-3">
          {[15, 30, 60].map((minutes) => (
            <label key={minutes} className="flex items-center gap-2">
              <input type="checkbox" checked={localSettings.notify_before_minutes.includes(minutes)} onChange={(e) => {
                const newList = e.target.checked ? [...localSettings.notify_before_minutes, minutes] : localSettings.notify_before_minutes.filter(m => m !== minutes);
                setLocalSettings({ ...localSettings, notify_before_minutes: newList });
              }} className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{minutes} minutes</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Maintenance Settings</button>
      </div>
    </div>
  );
};