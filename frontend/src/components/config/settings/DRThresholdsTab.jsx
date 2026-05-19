import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDRAutoFailover } from '../../../store/config/slices/configSettingsSlice';

export const DRThresholdsTab = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.config?.settings);
  const [localSettings, setLocalSettings] = useState({
    auto_failover: settings?.drAutoFailover ?? false,
    default_rto_target: 60,
    default_rpo_target: 240,
    drill_frequency_days: 30,
    max_parallel_recovery: 2,
    failover_timeout_minutes: 30,
    auto_failback_enabled: false
  });

  const handleSave = () => {
    dispatch(setDRAutoFailover(localSettings.auto_failover));
    alert('DR threshold settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><label className="font-medium text-gray-700">Auto Failover</label><p className="text-sm text-gray-500">Automatically failover when health checks fail</p></div>
            <button onClick={() => setLocalSettings({ ...localSettings, auto_failover: !localSettings.auto_failover })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.auto_failover ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.auto_failover ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Default RTO Target (minutes)</label>
            <input type="number" value={localSettings.default_rto_target} onChange={(e) => setLocalSettings({ ...localSettings, default_rto_target: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="5" max="1440" />
            <p className="text-xs text-gray-500 mt-1">Recovery Time Objective for new DR plans</p>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Default RPO Target (minutes)</label>
            <input type="number" value={localSettings.default_rpo_target} onChange={(e) => setLocalSettings({ ...localSettings, default_rpo_target: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="5" max="10080" />
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Drill Frequency (days)</label>
            <input type="number" value={localSettings.drill_frequency_days} onChange={(e) => setLocalSettings({ ...localSettings, drill_frequency_days: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="7" max="180" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Parallel Recovery</label>
            <input type="number" value={localSettings.max_parallel_recovery} onChange={(e) => setLocalSettings({ ...localSettings, max_parallel_recovery: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" max="10" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><label className="font-medium text-gray-700">Auto Failback</label><p className="text-sm text-gray-500">Automatically return to primary after recovery</p></div>
            <button onClick={() => setLocalSettings({ ...localSettings, auto_failback_enabled: !localSettings.auto_failback_enabled })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.auto_failback_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.auto_failback_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save DR Settings</button>
      </div>
    </div>
  );
};