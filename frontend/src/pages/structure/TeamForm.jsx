import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, X, Users, AlertCircle } from 'lucide-react';
import { DepartmentSelector } from '../../components/structure/department';
import { TeamSelector } from '../../components/structure/team';
import { useTeam, useTeamMutations, useDepartments, useTeams, useEmployments } from '../../hooks/structure';
import { createTeam, updateTeam } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const TeamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const departmentIdFromState = location.state?.departmentId;
  const { data: existingTeam, isLoading: isLoadingTeam } = useTeam(id, { enabled: isEditMode });
  const { data: departmentsPage } = useDepartments({ page: 1, pageSize: 1000 });
  const departments = departmentsPage?.results ?? [];
  const { data: teamsPage } = useTeams({ page: 1, pageSize: 1000 });
  const teams = teamsPage?.results ?? [];
  const { data: employmentsPage } = useEmployments({ filters: { is_current: 'true' }, page: 1, pageSize: 1000 });
  const employments = employmentsPage?.results ?? [];
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department_id: departmentIdFromState || '',
    parent_team_id: '',
    team_lead: '',
    max_members: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  useEffect(() => {
    if (isEditMode && existingTeam) {
      setFormData({
        code: existingTeam.code || '',
        name: existingTeam.name || '',
        description: existingTeam.description || '',
        department_id: existingTeam.department_id || '',
        parent_team_id: existingTeam.parent_team_id || '',
        team_lead: existingTeam.team_lead || '',
        max_members: existingTeam.max_members || '',
        is_active: existingTeam.is_active,
      });
    }
  }, [isEditMode, existingTeam]);
  useEffect(() => {
    if (formData.department_id && teams) {
      setAvailableTeams(teams.filter(team => 
        team.department_id === formData.department_id && 
        (!isEditMode || team.id !== id)
      ));
    } else {
      setAvailableTeams([]);
    }
  }, [formData.department_id, teams, isEditMode, id]);
  const availableTeamLeads = employments?.filter(emp => 
    emp.is_manager && 
    emp.department_id === formData.department_id &&
    emp.is_current
  ) || [];
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
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : parseInt(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
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
    if (!formData.code.trim()) newErrors.code = 'Team code is required';
    if (!formData.name.trim()) newErrors.name = 'Team name is required';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (formData.max_members !== '' && formData.max_members < 0) {
      newErrors.max_members = 'Max members cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description,
      department_id: formData.department_id,
      parent_team_id: formData.parent_team_id || null,
      team_lead: formData.team_lead || null,
      max_members: formData.max_members === '' ? null : formData.max_members,
      is_active: formData.is_active,
    };
    try {
      if (isEditMode) {
        await dispatch(updateTeam({ id, data: submitData })).unwrap();
        dispatch(showToast({ message: 'Team updated successfully', type: 'success' }));
      } else {
        await dispatch(createTeam(submitData)).unwrap();
        dispatch(showToast({ message: 'Team created successfully', type: 'success' }));
      }
      navigate(STRUCTURE_ROUTES.TEAMS);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save team' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.TEAMS);
  };
  if (isEditMode && isLoadingTeam) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Users size={20} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Team' : 'Create New Team'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Update team information' : 'Add a new team to your organization'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          {/* Code and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., ENG-FE-01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEditMode}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              <p className="mt-1 text-xs text-gray-400">Unique identifier for the team</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Frontend Engineering"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Parent Team (Optional)
              </label>
              <TeamSelector
                value={formData.parent_team_id}
                onChange={(value) => handleSelectChange('parent_team_id', value)}
                teams={availableTeams}
                placeholder="Select parent team"
                disabled={!formData.department_id}
              />
              {!formData.department_id && (
                <p className="mt-1 text-xs text-gray-400">Select a department first</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Lead (Optional)
              </label>
              <select
                name="team_lead"
                value={formData.team_lead}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={!formData.department_id}
              >
                <option value="">Select team lead...</option>
                {availableTeamLeads.map(emp => (
                  <option key={emp.user_id} value={emp.user_id}>
                    {emp.user_id} - {emp.position?.title || 'Manager'}
                  </option>
                ))}
              </select>
              {!formData.department_id && (
                <p className="mt-1 text-xs text-gray-400">Select a department first</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Members (Optional)
              </label>
              <input
                type="number"
                name="max_members"
                value={formData.max_members}
                onChange={handleNumberChange}
                min="1"
                placeholder="Leave empty for no limit"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.max_members ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.max_members && <p className="mt-1 text-sm text-red-500">{errors.max_members}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the team's purpose and responsibilities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <p className="mt-1 text-xs text-gray-400">Inactive teams are hidden from most views</p>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Team' : 'Create Team')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default TeamForm;