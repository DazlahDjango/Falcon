import { useState } from 'react';
import { useSchedule } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { ScheduleForm } from './ScheduleForm';
import { ScheduleToggle } from './ScheduleToggle';
import { ScheduleNextRuns } from './ScheduleNextRuns';
import { FiPlus, FiEdit, FiTrash2, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

export const ScheduleList = () => {
  const { useSchedules, deleteSchedule } = useSchedule();
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const { data, isLoading, refetch } = useSchedules();

  const schedules = data?.data?.results || [];

  const handleDelete = async (id) => {
    if (confirm('Delete this schedule?')) {
      await deleteSchedule.mutateAsync(id);
      refetch();
    }
  };

  const getScheduleTypeLabel = (type) => {
    const labels = { backup: 'Backup', maintenance: 'Maintenance', health_check: 'Health Check', dr_drill: 'DR Drill' };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Schedules</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /> Create Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Cron Expression</th>
              <th className="px-5 py-3">Next Run</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No schedules found</td></tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{schedule.name}</td>
                  <td className="px-5 py-3"><StatusBadge status={schedule.schedule_type} customLabel={getScheduleTypeLabel(schedule.schedule_type)} size="sm" /></td>
                  <td className="px-5 py-3 font-mono text-sm">{schedule.cron_expression}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <FiClock className="text-gray-400 text-xs" />
                      <span className="text-sm">{schedule.next_run_at ? format(new Date(schedule.next_run_at), 'MMM dd, HH:mm') : '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><ScheduleToggle schedule={schedule} onToggle={refetch} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingSchedule(schedule)} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiEdit className="text-gray-500" /></button>
                      <button onClick={() => handleDelete(schedule.id)} className="p-1.5 hover:bg-red-100 rounded-lg"><FiTrash2 className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(showForm || editingSchedule) && (
        <ScheduleForm
          schedule={editingSchedule}
          onClose={() => { setShowForm(false); setEditingSchedule(null); }}
          onSuccess={() => { refetch(); setShowForm(false); setEditingSchedule(null); }}
        />
      )}
    </div>
  );
};