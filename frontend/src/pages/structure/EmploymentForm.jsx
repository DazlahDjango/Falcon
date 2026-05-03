import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Briefcase, AlertCircle } from 'lucide-react';
import { PositionSelector } from '../../components/structure/position';
import { DepartmentSelector } from '../../components/structure/department';
import { TeamSelector } from '../../components/structure/team';
import { useEmployment, useEmploymentMutations, usePositions, useDepartments, useTeams } from '../../hooks/structure';
import { createEmployment, updateEmployment } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { EMPLOYMENT_TYPE, EMPLOYMENT_TYPE_LABELS } from '../../config/constants/structureConstants';

const EmploymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const { data: existingEmployment, isLoading: isLoadingEmployment } = useEmployment(id, { enabled: isEditMode });
  const { data: positionsPage } = usePositions({ page: 1, pageSize: 1000 });
  const positions = positionsPage?.results ?? [];
  const { data: departmentsPage } = useDepartments({ page: 1, pageSize: 1000 });
  const departments = departmentsPage?.results ?? [];
  const { data: teamsPage } = useTeams({ page: 1, pageSize: 1000 });
  const teams = teamsPage?.results ?? [];
  const [formData, setFormData] = useState({
    user_id: '',
    position_id: '',
    department_id: '',
    team_id: '',
    employment_type: 'permanent',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    is_manager: false,
    is_executive: false,
    is_board_member: false,
    change_reason: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  useEffect(() => {
    if (isEditMode && existingEmployment) {
      setFormData({
        user_id: existingEmployment.user_id || '',
        position_id: existingEmployment.position_id || '',
        department_id: existingEmployment.department_id || '',
        team_id: existingEmployment.team_id || '',
        employment_type: existingEmployment.employment_type || 'permanent',
        effective_from: existingEmployment.effective_from?.split('T')[0] || new Date().toISOString().split('T')[0],
        effective_to: existingEmployment.effective_to?.split('T')[0] || '',
        is_manager: existingEmployment.is_manager || false,
        is_executive: existingEmployment.is_executive || false,
        is_board_member: existingEmployment.is_board_member || false,
        change_reason: existingEmployment.change_reason || '',
      });
    }
  }, [isEditMode, existingEmployment]);
  useEffect(() => {
    if (formData.department_id && teams) {
      setAvailableTeams(teams.filter(team => team.department_id === formData.department_id));
    } else {
      setAvailableTeams([]);
    }
  }, [formData.department_id, teams]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.user_id) newErrors.user_id = 'User ID is required';
    if (!formData.position_id) newErrors.position_id = 'Position is required';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (!formData.effective_from) newErrors.effective_from = 'Effective from date is required';
    if (formData.effective_to && formData.effective_from > formData.effective_to) {
      newErrors.effective_to = 'Effective to must be after effective from';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = {
      user_id: formData.user_id,
      position_id: formData.position_id,
      department_id: formData.department_id,
      team_id: formData.team_id || null,
      employment_type: formData.employment_type,
      effective_from: formData.effective_from,
      effective_to: formData.effective_to || null,
      is_manager: formData.is_manager,
      is_executive: formData.is_executive,
      is_board_member: formData.is_board_member,
      change_reason: formData.change_reason,
    };
    try {
      if (isEditMode) {
        await dispatch(updateEmployment({ id, data: submitData })).unwrap();
        dispatch(showToast({ message: 'Employment updated successfully', type: 'success' }));
      } else {
        await dispatch(createEmployment(submitData)).unwrap();
        dispatch(showToast({ message: 'Employment created successfully', type: 'success' }));
      }
      navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save employment' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  };
  if (isEditMode && isLoadingEmployment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Briefcase size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Employment' : 'Create Employment'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Update employment details' : 'Assign an employee to a position'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              placeholder="Enter user UUID"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                errors.user_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditMode}
            />
            {errors.user_id && <p className="mt-1 text-sm text-red-500">{errors.user_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <PositionSelector
              value={formData.position_id}
              onChange={(value) => handleSelectChange('position_id', value)}
              positions={positions}
              placeholder="Select position"
            />
            {errors.position_id && <p className="mt-1 text-sm text-red-500">{errors.position_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <DepartmentSelector
              value={formData.department_id}
              onChange={(value) => handleSelectChange('department_id', value)}
              departments={departments}
              placeholder="Select department"
            />
            {errors.department_id && <p className="mt-1 text-sm text-red-500">{errors.department_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team (Optional)
            </label>
            <TeamSelector
              value={formData.team_id}
              onChange={(value) => handleSelectChange('team_id', value)}
              teams={availableTeams}
              placeholder="Select team"
              disabled={!formData.department_id}
            />
            {!formData.department_id && (
              <p className="mt-1 text-xs text-gray-400">Select a department first</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="effective_from"
                value={formData.effective_from}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.effective_from ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.effective_from && <p className="mt-1 text-sm text-red-500">{errors.effective_from}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective To (Optional)
              </label>
              <input
                type="date"
                name="effective_to"
                value={formData.effective_to}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.effective_to ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.effective_to && <p className="mt-1 text-sm text-red-500">{errors.effective_to}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_manager"
                checked={formData.is_manager}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Manager</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_executive"
                checked={formData.is_executive}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Executive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_board_member"
                checked={formData.is_board_member}
                onChange={handleChange}
                className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Board Member</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Reason
            </label>
            <textarea
              name="change_reason"
              value={formData.change_reason}
              onChange={handleChange}
              rows={2}
              placeholder="Reason for this employment record..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{errors.submit}</span>
            </div>
          )}
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
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Employment' : 'Create Employment')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EmploymentForm;