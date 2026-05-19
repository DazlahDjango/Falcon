import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setNotificationChannels, setAlertThresholds } from '../../../store/config/slices/configSettingsSlice';
import { FiMail, FiMessageSquare, FiBell, FiLink } from 'react-icons/fi';  // Changed FiWebhook to FiLink

export const NotificationSettingsTab = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.config?.settings);
  const [localSettings, setLocalSettings] = useState({
    channels: settings?.notificationChannels ?? ['email', 'in_app'],
    email_recipients: ['admin@falcon.com'],
    slack_webhook: '',
    backup_failure_threshold: 3,
    maintenance_reminder_hours: 24,
    quota_alert_threshold: 80,
    health_check_failure_threshold: 3
  });

  const channels = [
    { id: 'email', label: 'Email', icon: FiMail, description: 'Send email notifications' },
    { id: 'in_app', label: 'In-App', icon: FiBell, description: 'Show in-app notifications' },
    { id: 'slack', label: 'Slack', icon: FiMessageSquare, description: 'Send to Slack webhook' },
    { id: 'webhook', label: 'Webhook', icon: FiLink, description: 'Send to custom webhook' }  // Changed FiWebhook to FiLink
  ];

  const handleSave = () => {
    dispatch(setNotificationChannels(localSettings.channels));
    dispatch(setAlertThresholds({
      backupFailure: localSettings.backup_failure_threshold,
      quotaWarningPercent: localSettings.quota_alert_threshold,
      healthCheckConsecutiveFailures: localSettings.health_check_failure_threshold
    }));
    alert('Notification settings saved');
  };

  const toggleChannel = (channelId) => {
    setLocalSettings(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isEnabled = localSettings.channels.includes(channel.id);
          return (
            <div key={channel.id} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`} onClick={() => toggleChannel(channel.id)}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}><Icon className="text-xl" /></div>
                <div><h4 className="font-medium text-gray-800">{channel.label}</h4><p className="text-sm text-gray-500">{channel.description}</p></div>
                <div className="ml-auto"><input type="checkbox" checked={isEnabled} onChange={() => {}} className="w-5 h-5 text-blue-600 rounded" /></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Recipients</label>
          <input type="text" value={localSettings.email_recipients.join(', ')} onChange={(e) => setLocalSettings({ ...localSettings, email_recipients: e.target.value.split(',').map(s => s.trim()) })} placeholder="admin@example.com, ops@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Slack Webhook URL</label>
          <input type="url" value={localSettings.slack_webhook} onChange={(e) => setLocalSettings({ ...localSettings, slack_webhook: e.target.value })} placeholder="https://hooks.slack.com/services/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Backup Failure Threshold</label>
          <input type="number" value={localSettings.backup_failure_threshold} onChange={(e) => setLocalSettings({ ...localSettings, backup_failure_threshold: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" max="10" />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Quota Alert Threshold (%)</label>
          <input type="number" value={localSettings.quota_alert_threshold} onChange={(e) => setLocalSettings({ ...localSettings, quota_alert_threshold: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="50" max="95" />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Notification Settings</button>
      </div>
    </div>
  );
};