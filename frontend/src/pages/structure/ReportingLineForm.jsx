import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, GitBranch, AlertCircle } from 'lucide-react';
import { useReportingLine, useReportingLineMutations, useEmployments } from '../../hooks/structure';
import { ReportingWeightSlider, ApprovalPermissions } from '../../components/structure/reporting';
import { createReportingLine, updateReportingLine } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { REPORTING_RELATION_TYPE, REPORTING_RELATION_TYPE_LABELS } from '../../config/constants/structureConstants';

const ReportingLineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const { data: existingLine, isLoading: isLoadingLine } = useReportingLine(id, { enabled: isEditMode });
  const { data: employments } = useEmployments({ filters: { is_current: 'true' }, page: 1, pageSize: 1000 });
  const [formData, setFormData] = useState({
    employee_id: '',
    manager_id: '',
    relation_type: 'solid',
    reporting_weight: 1.0,
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    can_approve_kpi: true,
    can_conduct_review: true,
    can_approve_leave: false,
    can_approve_expenses: false,
    change_reason: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isEditMode && existingLine) {
      setFormData({
        employee_id: existingLine.employee_id || '',
        manager_id: existingLine.manager_id || '',
        relation_type: existingLine.relation_type || 'solid',
        reporting_weight: existingLine.reporting_weight || 1.0,
        effective_from: existingLine.effective_from?.split('T')[0] || new Date().toISOString().split('T')[0],
        effective_to: existingLine.effective_to?.split('T')[0] || '',
        can_approve_kpi: existingLine.can_approve_kpi ?? true,
        can_conduct_review: existingLine.can_conduct_review ?? true,
        can_approve_leave: existingLine.can_approve_leave || false,
        can_approve_expenses: existingLine.can_approve_expenses || false,
        change_reason: existingLine.change_reason || '',
      });
    }
  }, [isEditMode, existingLine]);
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
  const handleWeightChange = (value) => {
    setFormData(prev => ({ ...prev, reporting_weight: value }));
  };
  const handlePermissionsChange = (permissions) => {
    setFormData(prev => ({ ...prev, ...permissions }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = 'Employee is required';
    if (!formData.manager_id) newErrors.manager_id = 'Manager is required';
    if (formData.employee_id === formData.manager_id) {
      newErrors.manager_id = 'Employee cannot report to themselves';
    }
    if (formData.reporting_weight < 0 || formData.reporting_weight > 1) {
      newErrors.reporting_weight = 'Reporting weight must be between 0 and 1';
    }
    if (formData.effective_from && formData.effective_to && formData.effective_from > formData.effective_to) {
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
      employee_id: formData.employee_id,
      manager_id: formData.manager_id,
      relation_type: formData.relation_type,
      reporting_weight: formData.reporting_weight,
      effective_from: formData.effective_from,
      effective_to: formData.effective_to || null,
      can_approve_kpi: formData.can_approve_kpi,
      can_conduct_review: formData.can_conduct_review,
      can_approve_leave: formData.can_approve_leave,
      can_approve_expenses: formData.can_approve_expenses,
      change_reason: formData.change_reason,
    };
    try {
      if (isEditMode) {
        await dispatch(updateReportingLine({ id, data: submitData })).unwrap();
        dispatch(showToast({ message: 'Reporting line updated successfully', type: 'success' }));
      } else {
        await dispatch(createReportingLine(submitData)).unwrap();
        dispatch(showToast({ message: 'Reporting line created successfully', type: 'success' }));
      }
      navigate(STRUCTURE_ROUTES.REPORTING_LINES);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save reporting line' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINES);
  };
  const employeeOptions = employments?.map(emp => ({
    value: emp.id,
    label: `${emp.user_id} - ${emp.position?.title || 'No position'}`,
    department: emp.department?.name,
  })) || [];
  const managerOptions = employments?.filter(emp => emp.is_manager || emp.is_executive).map(emp => ({
    value: emp.id,
    label: `${emp.user_id} - ${emp.position?.title || 'Manager'}`,
    department: emp.department?.name,
  })) || [];
  if (isEditMode && isLoadingLine) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <GitBranch size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Reporting Line' : 'Create Reporting Line'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Define manager-employee reporting relationship
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditMode}
            >
              <option value="">Select employee...</option>
              {employeeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.employee_id && <p className="mt-1 text-sm text-red-500">{errors.employee_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager <span className="text-red-500">*</span>
            </label>
            <select
              name="manager_id"
              value={formData.manager_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.manager_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select manager...</option>
              {managerOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.manager_id && <p className="mt-1 text-sm text-red-500">{errors.manager_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <select
              name="relation_type"
              value={formData.relation_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(REPORTING_RELATION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {formData.relation_type !== 'solid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporting Weight
              </label>
              <ReportingWeightSlider
                value={formData.reporting_weight}
                onChange={handleWeightChange}
                size="md"
              />
              <p className="mt-1 text-xs text-gray-400">
                Percentage of reporting responsibility (100% = full reporting)
              </p>
              {errors.reporting_weight && <p className="mt-1 text-sm text-red-500">{errors.reporting_weight}</p>}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From
              </label>
              <input
                type="date"
                name="effective_from"
                value={formData.effective_from}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.effective_to ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.effective_to && <p className="mt-1 text-sm text-red-500">{errors.effective_to}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Permissions
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="can_approve_kpi"
                  checked={formData.can_approve_kpi}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Can approve KPI entries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="can_conduct_review"
                  checked={formData.can_conduct_review}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Can conduct performance reviews</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="can_approve_leave"
                  checked={formData.can_approve_leave}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Can approve leave requests</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="can_approve_expenses"
                  checked={formData.can_approve_expenses}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Can approve expense claims</span>
              </label>
            </div>
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
              placeholder="Reason for this reporting relationship..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Reporting Line' : 'Create Reporting Line')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ReportingLineForm;