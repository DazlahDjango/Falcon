import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import DepartmentSelector from '../department/DepartmentSelector';
import TeamSelector from '../team/TeamSelector';

const EmploymentTransferForm = ({ isOpen, onClose, employee, departments, teams, onTransfer, isTransferring = false }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  if (!isOpen) return null;
  const availableTeams = teams?.filter(team => team.department_id === selectedDepartmentId);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDepartmentId) return;
    await onTransfer({
      user_id: employee.user_id,
      department_id: selectedDepartmentId,
      team_id: selectedTeamId || null,
      effective_date: effectiveDate,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md employment-transfer-form">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Transfer Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
              {employee?.name || employee?.user_id}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Department *
            </label>
            <DepartmentSelector
              value={selectedDepartmentId}
              onChange={setSelectedDepartmentId}
              departments={departments}
              placeholder="Select department"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Team (Optional)
            </label>
            <TeamSelector
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              teams={availableTeams}
              placeholder="Select team"
              disabled={!selectedDepartmentId}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for transfer..."
              className="transfer-reason-input"
              rows="3"
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800 mb-4">
            <strong>Note:</strong> This will end the current employment and create a new one with the new department/team.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isTransferring}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedDepartmentId || isTransferring}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={14} className={isTransferring ? 'animate-spin' : ''} />
              {isTransferring ? 'Transferring...' : 'Transfer Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EmploymentTransferForm;