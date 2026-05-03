import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, DollarSign, AlertCircle } from 'lucide-react';
import { useCostCenter, useCostCenterMutations, useCostCenters } from '../../hooks/structure';
import { CostCenterTree } from '../../components/structure/cost-center';
import { createCostCenter, updateCostCenter } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { COST_CENTER_CATEGORY, COST_CENTER_CATEGORY_LABELS } from '../../config/constants/structureConstants';

const CostCenterForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const { data: existingCostCenter, isLoading: isLoadingCostCenter } = useCostCenter(id, { enabled: isEditMode });
  const { data: costCentersResponse } = useCostCenters({ page: 1, pageSize: 1000 });
  const costCenters = React.useMemo(() => {
    if (!costCentersResponse) return [];
    const ccData = costCentersResponse?.data?.results || costCentersResponse?.results || costCentersResponse;
    return Array.isArray(ccData) ? ccData : [];
  }, [costCentersResponse]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parent_id: '',
    category: 'operational',
    budget_amount: '',
    fiscal_year: new Date().getFullYear(),
    allocation_percentage: 100,
    is_active: true,
    is_shared: false,
    requires_budget_approval: true,
    authorized_approver_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isEditMode && existingCostCenter) {
      setFormData({
        code: existingCostCenter.code || '',
        name: existingCostCenter.name || '',
        description: existingCostCenter.description || '',
        parent_id: existingCostCenter.parent_id || '',
        category: existingCostCenter.category || 'operational',
        budget_amount: existingCostCenter.budget_amount || '',
        fiscal_year: existingCostCenter.fiscal_year || new Date().getFullYear(),
        allocation_percentage: existingCostCenter.allocation_percentage || 100,
        is_active: existingCostCenter.is_active,
        is_shared: existingCostCenter.is_shared,
        requires_budget_approval: existingCostCenter.requires_budget_approval ?? true,
        authorized_approver_ids: existingCostCenter.authorized_approver_ids || [],
      });
    }
  }, [isEditMode, existingCostCenter]);
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
    const numValue = value === '' ? '' : parseFloat(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Cost center code is required';
    if (!formData.name.trim()) newErrors.name = 'Cost center name is required';
    if (formData.budget_amount !== '' && formData.budget_amount < 0) {
      newErrors.budget_amount = 'Budget amount cannot be negative';
    }
    if (formData.allocation_percentage < 0 || formData.allocation_percentage > 100) {
      newErrors.allocation_percentage = 'Allocation percentage must be between 0 and 100';
    }
    if (formData.fiscal_year < 2000 || formData.fiscal_year > 2100) {
      newErrors.fiscal_year = 'Invalid fiscal year';
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
      category: formData.category,
      budget_amount: formData.budget_amount === '' ? null : formData.budget_amount,
      fiscal_year: formData.fiscal_year,
      allocation_percentage: formData.allocation_percentage,
      is_active: formData.is_active,
      is_shared: formData.is_shared,
      requires_budget_approval: formData.requires_budget_approval,
      authorized_approver_ids: formData.authorized_approver_ids,
    };
    console.log('Submitting data:', submitData);
    try {
      if (isEditMode) {
        await dispatch(updateCostCenter({ id, data: submitData })).unwrap();
        dispatch(showToast({ message: 'Cost center updated successfully', type: 'success' }));
      } else {
        await dispatch(createCostCenter(submitData)).unwrap();
        dispatch(showToast({ message: 'Cost center created successfully', type: 'success' }));
      }
      navigate(STRUCTURE_ROUTES.COST_CENTERS);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save cost center' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.COST_CENTERS);
  };
  if (isEditMode && isLoadingCostCenter) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }
  const availableParents = costCenters?.filter(cc => !isEditMode || cc.id !== id);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <DollarSign size={20} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Cost Center' : 'Create Cost Center'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Update cost center information' : 'Add a new cost center for budget tracking'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Center Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., FIN-001"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditMode}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            <p className="mt-1 text-xs text-gray-400">Unique identifier for the cost center</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Finance Department"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Cost Center
            </label>
            <select
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">None (Root)</option>
              {availableParents?.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Optional parent cost center for hierarchy</p>
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
              placeholder="Describe the cost center's purpose..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {Object.entries(COST_CENTER_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year
              </label>
              <input
                type="number"
                name="fiscal_year"
                value={formData.fiscal_year}
                onChange={handleNumberChange}
                min="2000"
                max="2100"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.fiscal_year ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fiscal_year && <p className="mt-1 text-sm text-red-500">{errors.fiscal_year}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="budget_amount"
                  value={formData.budget_amount}
                  onChange={handleNumberChange}
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.budget_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.budget_amount && <p className="mt-1 text-sm text-red-500">{errors.budget_amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="allocation_percentage"
                  value={formData.allocation_percentage}
                  onChange={handleNumberChange}
                  step="5"
                  min="0"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.allocation_percentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.allocation_percentage && <p className="mt-1 text-sm text-red-500">{errors.allocation_percentage}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_shared"
                checked={formData.is_shared}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Shared Service Center</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="requires_budget_approval"
                checked={formData.requires_budget_approval}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Requires Budget Approval</span>
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
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Cost Center' : 'Create Cost Center')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CostCenterForm;