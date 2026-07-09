import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiCalendar, FiPercent } from 'react-icons/fi';
import { useCostCenters, useStructureForm } from '../../../hooks/structure';
import ParentUnitSelect from '../common/ParentUnitSelect';
import GenericAllocationsEditor from '../common/GenericAllocationsEditor';
import CostCenterSelect from '../common/CostCenterSelect';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './costcenter.css';

export const CostCenterForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    create,
    update,
    clearError,
  } = useCostCenters({ autoFetch: false });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useStructureForm({
    initialValues: {
      code: '',
      name: '',
      description: '',
      allocations: [],
      category: 'operational',
      currency: 'USD',
      budget_amount: '',
      fiscal_year: new Date().getFullYear(),
      allocation_percentage: 100,
      manager_id: '',
      parent_id: '',
      valid_from: '',
      valid_to: '',
      custom_attributes: {},
      is_active: true,
      is_shared: false,
      requires_budget_approval: true,
      authorized_approver_ids: [],
    },
    onSubmit: async (formData) => {
      const submitData = {
        ...formData,
        budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : null,
        allocation_percentage: parseFloat(formData.allocation_percentage) || 100,
        fiscal_year: parseInt(formData.fiscal_year, 10),
      };
      if (isEditing) {
        await update(id, submitData);
      } else {
        await create(submitData);
      }
      navigate(STRUCTURE_ROUTES.COST_CENTERS);
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchById(id);
    }
  }, [isEditing, id, fetchById]);

  useEffect(() => {
    if (currentItem && isEditing) {
      resetForm({
        code: currentItem.code || '',
        name: currentItem.name || '',
        description: currentItem.description || '',
        allocations: currentItem.allocations || [],
        category: currentItem.category || 'operational',
        currency: currentItem.currency || 'USD',
        budget_amount: currentItem.budget_amount || '',
        fiscal_year: currentItem.fiscal_year || new Date().getFullYear(),
        allocation_percentage: currentItem.allocation_percentage || 100,
        manager_id: currentItem.manager_id || '',
        parent_id: currentItem.parent_id || '',
        valid_from: currentItem.valid_from || '',
        valid_to: currentItem.valid_to || '',
        custom_attributes: currentItem.custom_attributes || {},
        is_active: currentItem.is_active !== undefined ? currentItem.is_active : true,
        is_shared: currentItem.is_shared || false,
        requires_budget_approval: currentItem.requires_budget_approval !== undefined ? currentItem.requires_budget_approval : true,
        authorized_approver_ids: currentItem.authorized_approver_ids || [],
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.COST_CENTERS);
  }, [navigate]);

  const categoryOptions = [
    { value: 'operational', label: 'Operational' },
    { value: 'capital', label: 'Capital' },
    { value: 'project', label: 'Project' },
    { value: 'departmental', label: 'Departmental' },
    { value: 'shared', label: 'Shared Service' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  if (isEditing && isLoading) {
    return (
      <div className="costcenter-form-loading">
        <StructureLoading text="Loading cost center..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="costcenter-form-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (isEditing && !currentItem) {
    return (
      <StructureEmptyState
        title="Cost Center Not Found"
        description="The cost center you are looking for does not exist."
        actionLabel="Back to Cost Centers"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="costcenter-form-container">
      <div className="costcenter-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Cost Center' : 'Create Cost Center'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.name}` : 'New Cost Center'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={isEditing}
      >
        <div className="form-group">
          <label htmlFor="code">
            Code <span className="required">*</span>
          </label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="e.g., CC-001"
            value={values.code || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <span className="form-hint">Unique identifier for the cost center</span>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., IT Operations"
            value={values.name || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the cost center's purpose..."
            rows="3"
            value={values.description || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-full">
          <GenericAllocationsEditor
            allocations={values.allocations}
            onChange={(newAllocations) => setFieldValue('allocations', newAllocations)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={values.category || 'operational'}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="budget_amount">Budget Amount</label>
            <div className="input-with-icon">
              <FiDollarSign className="input-icon" size={16} />
              <input
                id="budget_amount"
                name="budget_amount"
                type="number"
                placeholder="0.00"
                value={values.budget_amount || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={values.currency || 'USD'}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="KES">KES - Kenyan Shilling</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="parent_id">Parent Cost Center</label>
            <CostCenterSelect
              value={values.parent_id}
              onChange={(v) => setFieldValue('parent_id', v)}
              placeholder="Select parent budget (optional)"
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="manager_id">Manager ID</label>
            <input
              id="manager_id"
              name="manager_id"
              type="text"
              placeholder="Enter Employee ID"
              value={values.manager_id || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="valid_from">Valid From</label>
            <input
              id="valid_from"
              name="valid_from"
              type="date"
              value={values.valid_from || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="valid_to">Valid To</label>
            <input
              id="valid_to"
              name="valid_to"
              type="date"
              value={values.valid_to || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fiscal_year">
            Fiscal Year <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <FiCalendar className="input-icon" size={16} />
            <select
              id="fiscal_year"
              name="fiscal_year"
              value={values.fiscal_year || currentYear}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="allocation_percentage">Allocation Percentage</label>
          <div className="input-with-icon">
            <FiPercent className="input-icon" size={16} />
            <input
              id="allocation_percentage"
              name="allocation_percentage"
              type="number"
              placeholder="100"
              value={values.allocation_percentage || 100}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          <span className="form-hint">Percentage of total budget allocated (0-100)</span>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_active"
              type="checkbox"
              checked={values.is_active || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Active</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_shared"
              type="checkbox"
              checked={values.is_shared || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Shared Service</span>
          </label>
          <span className="form-hint">Shared across multiple units</span>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="requires_budget_approval"
              type="checkbox"
              checked={values.requires_budget_approval !== false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Requires Budget Approval</span>
          </label>
        </div>
      </StructureForm>
    </div>
  );
};

export default CostCenterForm;
