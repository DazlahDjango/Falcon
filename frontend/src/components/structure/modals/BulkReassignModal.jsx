import React, { useState } from 'react';
import { X, Users, RefreshCw, AlertCircle } from 'lucide-react';
import DepartmentSelector from '../department/DepartmentSelector';
import TeamSelector from '../team/TeamSelector';
import PositionSelector from '../position/PositionSelector';

const BulkReassignModal = ({ isOpen, onClose, onReassign, employees, departments, teams, positions, isReassigning = false, className = '' }) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [reassignType, setReassignType] = useState('manager');
  const [newManagerId, setNewManagerId] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newTeamId, setNewTeamId] = useState('');
  const [newPositionId, setNewPositionId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleToggleEmployee = (userId) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    setError('');
  };
  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === employees?.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees?.map(e => e.user_id) || []);
    }
  };
  const handleSubmit = async () => {
    if (selectedEmployeeIds.length === 0) {
      setError('Please select at least one employee');
      return;
    }
    if (reassignType === 'manager' && !newManagerId) {
      setError('Please select a new manager');
      return;
    }
    if (reassignType === 'department' && !newDepartmentId) {
      setError('Please select a new department');
      return;
    }
    await onReassign({
      employee_ids: selectedEmployeeIds,
      reassign_type: reassignType,
      new_manager_id: newManagerId,
      new_department_id: newDepartmentId,
      new_team_id: newTeamId,
      new_position_id: newPositionId,
      effective_date: effectiveDate,
    });
  };
  const availableTeams = teams?.filter(team => team.department_id === newDepartmentId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-container-xl ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-purple-500" />
            <h3 className="text-lg font-semibold">Bulk Reassignment</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {/* Employee Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Select Employees ({selectedEmployeeIds.length} selected)</label>
              <button onClick={handleSelectAll} className="text-xs text-blue-600 hover:text-blue-700">
                {selectedEmployeeIds.length === employees?.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {employees?.map(emp => (
                <label key={emp.user_id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selectedEmployeeIds.includes(emp.user_id)}
                    onChange={() => handleToggleEmployee(emp.user_id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{emp.name || emp.user_id}</div>
                    <div className="text-xs text-gray-500">{emp.position_title}</div>
                  </div>
                  <div className="text-xs text-gray-400">{emp.department_name}</div>
                </label>
              ))}
            </div>
          </div>
          {/* Reassignment Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reassign Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="manager"
                  checked={reassignType === 'manager'}
                  onChange={(e) => setReassignType(e.target.value)}
                />
                <span>Manager</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="department"
                  checked={reassignType === 'department'}
                  onChange={(e) => setReassignType(e.target.value)}
                />
                <span>Department</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="position"
                  checked={reassignType === 'position'}
                  onChange={(e) => setReassignType(e.target.value)}
                />
                <span>Position</span>
              </label>
            </div>
          </div>
          {reassignType === 'manager' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Manager</label>
              <select
                value={newManagerId}
                onChange={(e) => setNewManagerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select manager...</option>
                {employees?.filter(e => !selectedEmployeeIds.includes(e.user_id)).map(emp => (
                  <option key={emp.user_id} value={emp.user_id}>{emp.name || emp.user_id}</option>
                ))}
              </select>
            </div>
          )}
          {reassignType === 'department' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Department</label>
                <DepartmentSelector
                  value={newDepartmentId}
                  onChange={setNewDepartmentId}
                  departments={departments}
                  placeholder="Select department"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Team (Optional)</label>
                <TeamSelector
                  value={newTeamId}
                  onChange={setNewTeamId}
                  teams={availableTeams}
                  placeholder="Select team"
                  disabled={!newDepartmentId}
                />
              </div>
            </>
          )}
          {reassignType === 'position' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Position</label>
              <PositionSelector
                value={newPositionId}
                onChange={setNewPositionId}
                positions={positions}
                placeholder="Select position"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isReassigning}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedEmployeeIds.length === 0 || isReassigning}
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={14} className={isReassigning ? 'animate-spin' : ''} />
            {isReassigning ? 'Reassigning...' : `Reassign (${selectedEmployeeIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
export default BulkReassignModal;