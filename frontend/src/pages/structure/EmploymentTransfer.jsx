import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, Building2, Users, Calendar, AlertCircle } from 'lucide-react';
import { DepartmentSelector } from '../../components/structure/department';
import { TeamSelector } from '../../components/structure/team';
import { CurrentEmploymentCard } from '../../components/structure/employment';
import { useEmploymentsByUser, useEmploymentMutations, useDepartments, useTeams } from '../../hooks/structure';
import { transferEmployee } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const EmploymentTransfer = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: employments, isLoading: isLoadingEmployments } = useEmploymentsByUser(userId, false);
  const { data: departments } = useDepartments({ page: 1, pageSize: 1000 });
  const { data: teams } = useTeams({ page: 1, pageSize: 1000 });
  const currentEmployment = employments?.find(emp => emp.is_current && emp.is_active);
  const availableTeams = teams?.filter(team => team.department_id === selectedDepartmentId);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDepartmentId) {
      dispatch(showToast({ message: 'Please select a department', type: 'error' }));
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(transferEmployee({
        user_id: userId,
        department_id: selectedDepartmentId,
        team_id: selectedTeamId || null,
        effective_date: effectiveDate,
        reason,
      })).unwrap();
      dispatch(showToast({ message: 'Employee transferred successfully', type: 'success' }));
      navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Transfer failed', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  };
  if (isLoadingEmployments) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!currentEmployment) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
          <p className="text-red-600">No active employment found for this user</p>
          <button onClick={handleCancel} className="mt-3 text-blue-600 hover:text-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <RefreshCw size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Employee</h1>
          <p className="text-gray-500 text-sm mt-1">Move employee to a new department or team</p>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Current Employment</h2>
        <CurrentEmploymentCard employment={currentEmployment} />
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">This action will:</p>
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>End the current employment record</li>
                <li>Create a new employment record with the new department/team</li>
                <li>Preserve all employment history</li>
              </ul>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Department <span className="text-red-500">*</span>
            </label>
            <DepartmentSelector
              value={selectedDepartmentId}
              onChange={setSelectedDepartmentId}
              departments={departments}
              placeholder="Select new department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Team (Optional)
            </label>
            <TeamSelector
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              teams={availableTeams}
              placeholder="Select new team"
              disabled={!selectedDepartmentId}
            />
            {!selectedDepartmentId && (
              <p className="mt-1 text-xs text-gray-400">Select a department first</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-400">The date when the transfer takes effect</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Transfer
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain the reason for this transfer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedDepartmentId || isSubmitting}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={16} className={isSubmitting ? 'animate-spin' : ''} />
            {isSubmitting ? 'Transferring...' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EmploymentTransfer;