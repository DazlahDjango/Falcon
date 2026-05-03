import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, X, Building2, AlertCircle } from 'lucide-react';
import { DepartmentSelector } from '../../components/structure/department';
import { useDepartment, useDepartmentMutations, useDepartments } from '../../hooks/structure';
import { createDepartment, updateDepartment } from '../../store/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { DEPARTMENT_SENSITIVITY, DEPARTMENT_SENSITIVITY_LABELS } from '../../config/constants/structureConstants';

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const parentIdFromState = location.state?.parentId;
  const { data: existingDepartment, isLoading: isLoadingDepartment } = useDepartment(id, { enabled: isEditMode });
  const { data: departmentsPage } = useDepartments({ page: 1, pageSize: 1000 });
  const departments = departmentsPage?.results ?? [];
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parent_id: parentIdFromState || '',
    headcount_limit: '',
    sensitivity_level: 'internal',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isEditMode && existingDepartment) {
      setFormData({
        code: existingDepartment.code || '',
        name: existingDepartment.name || '',
        description: existingDepartment.description || '',
        parent_id: existingDepartment.parent_id || '',
        headcount_limit: existingDepartment.headcount_limit || '',
        sensitivity_level: existingDepartment.sensitivity_level || 'internal',
        is_active: existingDepartment.is_active,
      });
    }
  }, [isEditMode, existingDepartment]);
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
  const handleParentChange = (parentId) => {
    setFormData(prev => ({ ...prev, parent_id: parentId }));
    if (errors.parent_id) {
      setErrors(prev => ({ ...prev, parent_id: '' }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Department code is required';
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (formData.code && !/^[A-Z0-9][A-Z0-9\-_]{2,49}$/.test(formData.code)) {
      newErrors.code = 'Code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores';
    }
    if (formData.headcount_limit && formData.headcount_limit < 0) {
      newErrors.headcount_limit = 'Headcount limit must be positive';
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
      parent_id: formData.parent_id || null,
      headcount_limit: formData.headcount_limit ? parseInt(formData.headcount_limit) : null,
      sensitivity_level: formData.sensitivity_level,
      is_active: formData.is_active,
    };
    try {
      if (isEditMode) {
        await dispatch(updateDepartment({ id, data: submitData })).unwrap();
      } else {
        await dispatch(createDepartment(submitData)).unwrap();
      }
      navigate(STRUCTURE_ROUTES.DEPARTMENTS);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save department' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.DEPARTMENTS);
  };
  if (isEditMode && isLoadingDepartment) {
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
          <Building2 size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Department' : 'Create New Department'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Update department information' : 'Add a new department to your organization'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., FIN-001"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditMode}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            <p className="mt-1 text-xs text-gray-400">Unique identifier for the department</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Finance Department"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Department
            </label>
            <DepartmentSelector
              value={formData.parent_id}
              onChange={handleParentChange}
              departments={departments?.filter(d => d.id !== id)}
              placeholder="None (Root Department)"
            />
            <p className="mt-1 text-xs text-gray-400">Leave empty for root level department</p>
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
              placeholder="Describe the department's purpose and responsibilities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headcount Limit
            </label>
            <input
              type="number"
              name="headcount_limit"
              value={formData.headcount_limit}
              onChange={handleChange}
              placeholder="Leave empty for no limit"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.headcount_limit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.headcount_limit && <p className="mt-1 text-sm text-red-500">{errors.headcount_limit}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensitivity Level
            </label>
            <select
              name="sensitivity_level"
              value={formData.sensitivity_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(DEPARTMENT_SENSITIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Determines who can view this department's data
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <p className="mt-1 text-xs text-gray-400">Inactive departments are hidden from most views</p>
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
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Department' : 'Create Department')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default DepartmentForm;