import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Briefcase, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { DepartmentSelector } from '../../components/structure/department';
import { PositionSelector } from '../../components/structure/position';
import { usePosition, usePositionMutations, usePositions, useDepartments } from '../../hooks/structure';
import { createPosition, updatePosition } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { REPORTING_RELATION_TYPE, REPORTING_RELATION_TYPE_LABELS } from '../../config/constants/structureConstants';

const PositionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const { data: existingPosition, isLoading: isLoadingPosition } = usePosition(id, { enabled: isEditMode });
  const { data: positions } = usePositions({ page: 1, pageSize: 1000 });
  const { data: departments } = useDepartments({ page: 1, pageSize: 1000 });
  const [formData, setFormData] = useState({
    job_code: '',
    title: '',
    grade: '',
    level: 5,
    reports_to_id: '',
    default_department_id: '',
    default_reporting_type: 'solid',
    min_tenure_months: 0,
    required_competencies: [],
    is_single_incumbent: false,
    max_incumbents: '',
    requires_supervisor_approval: true,
  });
  const [newCompetency, setNewCompetency] = useState({ name: '', level: 3 });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isEditMode && existingPosition) {
      setFormData({
        job_code: existingPosition.job_code || '',
        title: existingPosition.title || '',
        grade: existingPosition.grade || '',
        level: existingPosition.level || 5,
        reports_to_id: existingPosition.reports_to_id || '',
        default_department_id: existingPosition.default_department_id || '',
        default_reporting_type: existingPosition.default_reporting_type || 'solid',
        min_tenure_months: existingPosition.min_tenure_months || 0,
        required_competencies: existingPosition.required_competencies || [],
        is_single_incumbent: existingPosition.is_single_incumbent || false,
        max_incumbents: existingPosition.max_incumbents || '',
        requires_supervisor_approval: existingPosition.requires_supervisor_approval ?? true,
      });
    }
  }, [isEditMode, existingPosition]);
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
  const handleAddCompetency = () => {
    if (newCompetency.name.trim()) {
      setFormData(prev => ({
        ...prev,
        required_competencies: [...prev.required_competencies, { ...newCompetency }]
      }));
      setNewCompetency({ name: '', level: 3 });
    }
  };
  const handleRemoveCompetency = (index) => {
    setFormData(prev => ({
      ...prev,
      required_competencies: prev.required_competencies.filter((_, i) => i !== index)
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.job_code.trim()) newErrors.job_code = 'Job code is required';
    if (!formData.title.trim()) newErrors.title = 'Position title is required';
    if (formData.level < 1 || formData.level > 20) newErrors.level = 'Level must be between 1 and 20';
    if (formData.max_incumbents !== '' && formData.max_incumbents < 1) {
      newErrors.max_incumbents = 'Max incumbents must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = {
      job_code: formData.job_code.toUpperCase(),
      title: formData.title,
      grade: formData.grade || null,
      level: formData.level,
      reports_to_id: formData.reports_to_id || null,
      default_department_id: formData.default_department_id || null,
      default_reporting_type: formData.default_reporting_type,
      min_tenure_months: formData.min_tenure_months,
      required_competencies: formData.required_competencies,
      is_single_incumbent: formData.is_single_incumbent,
      max_incumbents: formData.max_incumbents === '' ? null : formData.max_incumbents,
      requires_supervisor_approval: formData.requires_supervisor_approval,
    };
    try {
      if (isEditMode) {
        await dispatch(updatePosition({ id, data: submitData })).unwrap();
        dispatch(showToast({ message: 'Position updated successfully', type: 'success' }));
      } else {
        await dispatch(createPosition(submitData)).unwrap();
        dispatch(showToast({ message: 'Position created successfully', type: 'success' }));
      }
      navigate(STRUCTURE_ROUTES.POSITIONS);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save position' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.POSITIONS);
  };
  if (isEditMode && isLoadingPosition) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }
  const availablePositions = positions?.filter(pos => !isEditMode || pos.id !== id);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Briefcase size={20} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Position' : 'Create Position'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Update position information' : 'Add a new job position'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job_code"
                value={formData.job_code}
                onChange={handleChange}
                placeholder="e.g., ENG-001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono ${
                  errors.job_code ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEditMode}
              />
              {errors.job_code && <p className="mt-1 text-sm text-red-500">{errors.job_code}</p>}
              <p className="mt-1 text-xs text-gray-400">Format: 2-4 letters, hyphen, 3-5 digits</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade (Optional)
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g., P4, M2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="level"
                value={formData.level}
                onChange={handleNumberChange}
                min="1"
                max="20"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.level ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level}</p>}
              <p className="mt-1 text-xs text-gray-400">1 = CEO, 20 = Entry Level</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reports To Position (Optional)
              </label>
              <PositionSelector
                value={formData.reports_to_id}
                onChange={(value) => handleSelectChange('reports_to_id', value)}
                positions={availablePositions}
                placeholder="Select reporting position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Department (Optional)
              </label>
              <DepartmentSelector
                value={formData.default_department_id}
                onChange={(value) => handleSelectChange('default_department_id', value)}
                departments={departments}
                placeholder="Select default department"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Reporting Type
              </label>
              <select
                name="default_reporting_type"
                value={formData.default_reporting_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(REPORTING_RELATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Tenure (Months)
              </label>
              <input
                type="number"
                name="min_tenure_months"
                value={formData.min_tenure_months}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_single_incumbent"
                  checked={formData.is_single_incumbent}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Single Incumbent Only</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Incumbents (Optional)
              </label>
              <input
                type="number"
                name="max_incumbents"
                value={formData.max_incumbents}
                onChange={handleNumberChange}
                min="1"
                placeholder="Unlimited"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                  errors.max_incumbents ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={formData.is_single_incumbent}
              />
              {errors.max_incumbents && <p className="mt-1 text-sm text-red-500">{errors.max_incumbents}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Competencies
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCompetency.name}
                onChange={(e) => setNewCompetency(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Competency name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newCompetency.level}
                onChange={(e) => setNewCompetency(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
                <option value={4}>Level 4</option>
                <option value={5}>Level 5</option>
              </select>
              <button
                type="button"
                onClick={handleAddCompetency}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus size={16} />
              </button>
            </div>
            {formData.required_competencies.length > 0 && (
              <div className="space-y-2">
                {formData.required_competencies.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{comp.name}</span>
                      <span className="text-sm text-gray-500 ml-2">Level {comp.level}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetency(idx)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="requires_supervisor_approval"
                checked={formData.requires_supervisor_approval}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Requires Supervisor Approval for Assignment</span>
            </label>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Position' : 'Create Position')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default PositionForm;