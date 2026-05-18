import { useState } from 'react';
import { useMaintenance, useRegistry } from '../../../hooks/config';
import { FiX, FiCalendar, FiClock } from 'react-icons/fi';

export const MaintenanceScheduleForm = ({ onClose, onSuccess }) => {
  const { scheduleMaintenance } = useMaintenance();
  const { useRegisteredApps } = useRegistry();
  const { data: appsData } = useRegisteredApps();
  const apps = appsData?.data?.results || [];

  const [formData, setFormData] = useState({
    title: '',
    maintenance_type: 'partial',
    scheduled_start: '',
    scheduled_end: '',
    reason: '',
    affected_apps: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await scheduleMaintenance.mutateAsync(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to schedule maintenance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppToggle = (appId) => {
    setFormData(prev => ({
      ...prev,
      affected_apps: prev.affected_apps.includes(appId)
        ? prev.affected_apps.filter(id => id !== appId)
        : [...prev.affected_apps, appId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Schedule Maintenance</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <div className="flex gap-3">
              {['full', 'partial', 'emergency'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input type="radio" name="maintenance_type" value={type} checked={formData.maintenance_type === type} onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })} />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1"><FiCalendar className="inline mr-1" /> Start Time *</label>
              <input type="datetime-local" value={formData.scheduled_start} onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1"><FiClock className="inline mr-1" /> End Time *</label>
              <input type="datetime-local" value={formData.scheduled_end} onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea rows="3" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          {formData.maintenance_type === 'partial' && (
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Affected Applications</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {apps.map(app => (
                  <label key={app.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.affected_apps.includes(app.id)} onChange={() => handleAppToggle(app.id)} />
                    <span className="text-sm">{app.display_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};