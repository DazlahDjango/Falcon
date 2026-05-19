import { useState } from 'react';
import { useMaintenance } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { MaintenanceScheduleForm } from './MaintenanceScheduleForm';
import { MaintenanceActions } from './MaintenanceActions';
import { FiPlus, FiEye, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

export const MaintenanceList = () => {
  const { useMaintenanceWindows } = useMaintenance();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', maintenance_type: '' });
  const { data, isLoading } = useMaintenanceWindows(filters);

  const windows = data?.data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Windows</h1>
        <button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /> Schedule Maintenance
        </button>
      </div>

      <div className="flex gap-3">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" onChange={(e) => setFilters({ ...filters, maintenance_type: e.target.value })}>
          <option value="">All Types</option>
          <option value="full">Full</option>
          <option value="partial">Partial</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Scheduled Start</th>
              <th className="px-5 py-3">Scheduled End</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : windows.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No maintenance windows found</td></tr>
            ) : (
              windows.map((window) => (
                <tr key={window.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{window.title}</td>
                  <td className="px-5 py-3"><StatusBadge status={window.maintenance_type} customLabel={window.maintenance_type.charAt(0).toUpperCase() + window.maintenance_type.slice(1)} size="sm" /></td>
                  <td className="px-5 py-3"><StatusBadge status={window.status} size="sm" /></td>
                  <td className="px-5 py-3 text-sm">{format(new Date(window.scheduled_start), 'MMM dd, HH:mm')}</td>
                  <td className="px-5 py-3 text-sm">{format(new Date(window.scheduled_end), 'MMM dd, HH:mm')}</td>
                  <td className="px-5 py-3"><MaintenanceActions window={window} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showScheduleForm && <MaintenanceScheduleForm onClose={() => setShowScheduleForm(false)} onSuccess={() => setShowScheduleForm(false)} />}
    </div>
  );
};