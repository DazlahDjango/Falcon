import { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/config';
import { useRegistry } from '../../../hooks/config';
import { SCHEDULE_TYPES, SCHEDULE_TYPE_LABELS } from '../../../config/constants/configConstants';
import { CronHelper } from './CronHelper';
import { FiX, FiClock } from 'react-icons/fi';

export const ScheduleForm = ({ schedule, onClose, onSuccess }) => {
  const { createSchedule, updateSchedule, validateCron } = useSchedule();
  const { useBackupPolicies } = useBackup ? useBackupPolicies : () => ({ data: null });
  const { data: policiesData } = useBackupPolicies?.() || { data: null };
  const policies = policiesData?.data?.results || [];

  const [formData, setFormData] = useState({
    name: '',
    schedule_type: SCHEDULE_TYPES.BACKUP,
    cron_expression: '0 2 * * *',
    timezone: 'UTC',
    weekday_only: true,
    status: 'active',
    associated_backup_policy: null
  });
  const [cronValid, setCronValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        schedule_type: schedule.schedule_type,
        cron_expression: schedule.cron_expression,
        timezone: schedule.timezone,
        weekday_only: schedule.weekday_only,
        status: schedule.status,
        associated_backup_policy: schedule.associated_backup_policy
      });
    }
  }, [schedule]);

  const handleCronChange = async (value) => {
    setFormData({ ...formData, cron_expression: value });
    try {
      await validateCron.mutateAsync(value);
      setCronValid(true);
    } catch {
      setCronValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cronValid) return;
    setIsLoading(true);
    try {
      if (schedule) {
        await updateSchedule.mutateAsync({ scheduleId: schedule.id, data: formData });
      } else {
        await createSchedule.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{schedule ? 'Edit Schedule' : 'Create Schedule'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
            <select value={formData.schedule_type} onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {Object.entries(SCHEDULE_TYPES).map(([key, value]) => <option key={value} value={value}>{SCHEDULE_TYPE_LABELS[value]}</option>)}
            </select>
          </div>
          {formData.schedule_type === SCHEDULE_TYPES.BACKUP && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Backup Policy</label>
              <select value={formData.associated_backup_policy || ''} onChange={(e) => setFormData({ ...formData, associated_backup_policy: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select a backup policy...</option>
                {policies.map(policy => <option key={policy.id} value={policy.id}>{policy.app_name} - {policy.backup_type}</option>)}
              </select>
            </div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression *</label>
            <input type="text" value={formData.cron_expression} onChange={(e) => handleCronChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg font-mono ${cronValid ? 'border-gray-300' : 'border-red-500'}`} required />
            {!cronValid && <p className="text-xs text-red-500 mt-1">Invalid cron expression</p>}
            <CronHelper value={formData.cron_expression} onChange={handleCronChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input type="text" value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.weekday_only} onChange={(e) => setFormData({ ...formData, weekday_only: e.target.checked })} className="w-4 h-4" /> Run on weekdays only</label>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 mb-2"><FiClock /> Schedule Preview</div>
            <ScheduleNextRuns cronExpression={formData.cron_expression} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading || !cronValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Save Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};