import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ScheduleReportModal = ({ reportType, onSchedule, onClose, loading }) => {
  const [schedule, setSchedule] = useState({
    frequency: 'weekly',
    day: 'monday',
    time: '09:00',
    recipients: [],
    format: 'pdf',
    include_charts: true,
  });
  const [newRecipient, setNewRecipient] = useState('');

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' },
  ];

  const handleChange = (e) => {
    setSchedule({
      ...schedule,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddRecipient = () => {
    if (newRecipient && !schedule.recipients.includes(newRecipient)) {
      setSchedule({
        ...schedule,
        recipients: [...schedule.recipients, newRecipient],
      });
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter(r => r !== email),
    });
  };

  const handleSubmit = () => {
    if (schedule.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }
    onSchedule(schedule);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Schedule Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              name="frequency"
              value={schedule.frequency}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {frequencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Day (for weekly) */}
          {schedule.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                name="day"
                value={schedule.day}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {dayOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={schedule.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              name="format"
              value={schedule.format}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {formatOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Include Charts */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={schedule.include_charts}
              onChange={(e) => setSchedule({ ...schedule, include_charts: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
          </label>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddRecipient}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            {schedule.recipients.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {schedule.recipients.map(email => (
                  <span key={email} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    {email}
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-800">
              📅 Reports will be automatically generated and sent to recipients at the scheduled time.
              You can manage scheduled reports from the Settings page.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleReportModal;