import { useState, useEffect } from 'react';
import { FiMail, FiMessageSquare, FiBell, FiLink } from 'react-icons/fi';
import { useConfigSettings } from '../../../hooks/config';

const DEFAULT_NOTIFICATIONS = {
  channels: ['email', 'in_app'],
  email_recipients: [],
  slack_webhook: '',
  webhook_url: '',
  backup_failure_threshold: 3,
  maintenance_reminder_hours: 24,
  quota_alert_threshold_percent: 80,
  health_check_failure_threshold: 3,
};

const CHANNELS = [
  { id: 'email', label: 'Email', icon: FiMail },
  { id: 'in_app', label: 'In-App', icon: FiBell },
  { id: 'slack', label: 'Slack', icon: FiMessageSquare },
  { id: 'webhook', label: 'Webhook', icon: FiLink },
];

export const NotificationSettingsTab = ({ sections, onSectionChange, canEdit }) => {
  const { saveSection, isSaving } = useConfigSettings();
  const [local, setLocal] = useState({ ...DEFAULT_NOTIFICATIONS, ...sections.notifications });

  useEffect(() => {
    setLocal({ ...DEFAULT_NOTIFICATIONS, ...sections.notifications });
  }, [sections.notifications]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSectionChange('notifications', next);
    onSectionChange('alert_thresholds', {
      ...sections.alert_thresholds,
      backup_failure: next.backup_failure_threshold,
      quota_warning_percent: next.quota_alert_threshold_percent,
      health_check_consecutive_failures: next.health_check_failure_threshold,
    });
  };

  const toggleChannel = (id) => {
    if (!canEdit) return;
    const channels = local.channels || [];
    update({
      channels: channels.includes(id) ? channels.filter((c) => c !== id) : [...channels, id],
    });
  };

  const handleSave = async () => {
    await saveSection('notifications', local);
    await saveSection('alert_thresholds', {
      backup_failure: local.backup_failure_threshold,
      quota_warning_percent: local.quota_alert_threshold_percent,
      health_check_consecutive_failures: local.health_check_failure_threshold,
      maintenance_overlap: sections.alert_thresholds?.maintenance_overlap ?? true,
      max_response_ms: sections.alert_thresholds?.max_response_ms ?? 5000,
    });
  };

  return (
    <div className="config-settings-section">
      <div className="config-settings-channel-grid">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          const active = (local.channels || []).includes(ch.id);
          return (
            <div
              key={ch.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleChannel(ch.id)}
              onKeyDown={(e) => e.key === 'Enter' && toggleChannel(ch.id)}
              className={`config-settings-channel-card ${active ? 'config-settings-channel-card--active' : ''} ${!canEdit ? 'config-settings-channel-card--disabled' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon style={{ fontSize: '1.25rem' }} />
                <span style={{ fontWeight: 500 }}>{ch.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="config-settings-grid-2">
        <div className="config-settings-field">
          <label>Email Recipients (comma-separated)</label>
          <input
            type="text"
            disabled={!canEdit}
            value={(local.email_recipients || []).join(', ')}
            onChange={(e) => update({ email_recipients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="ops@example.com"
          />
        </div>
        <div className="config-settings-field">
          <label>Slack Webhook URL</label>
          <input
            type="url"
            disabled={!canEdit}
            value={local.slack_webhook || ''}
            onChange={(e) => update({ slack_webhook: e.target.value })}
            placeholder="https://hooks.slack.com/..."
          />
        </div>
        <div className="config-settings-field">
          <label>Backup Failure Threshold</label>
          <input
            type="number"
            min={1}
            max={10}
            disabled={!canEdit}
            value={local.backup_failure_threshold}
            onChange={(e) => update({ backup_failure_threshold: parseInt(e.target.value, 10) })}
          />
        </div>
        <div className="config-settings-field">
          <label>Quota Alert Threshold (%)</label>
          <input
            type="number"
            min={50}
            max={95}
            disabled={!canEdit}
            value={local.quota_alert_threshold_percent}
            onChange={(e) => update({ quota_alert_threshold_percent: parseInt(e.target.value, 10) })}
          />
        </div>
        <div className="config-settings-field">
          <label>Health Failure Threshold (consecutive)</label>
          <input
            type="number"
            min={1}
            max={10}
            disabled={!canEdit}
            value={local.health_check_failure_threshold}
            onChange={(e) => update({ health_check_failure_threshold: parseInt(e.target.value, 10) })}
          />
        </div>
      </div>
      {canEdit && (
        <div className="config-settings-footer">
          <button type="button" onClick={handleSave} disabled={isSaving} className="config-settings-btn-primary">
            Save Notification Settings
          </button>
        </div>
      )}
    </div>
  );
};
