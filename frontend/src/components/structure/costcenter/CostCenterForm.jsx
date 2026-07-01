import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiCalendar, FiPercent } from 'react-icons/fi';
import { useCostCenters, useStructureForm } from '../../../hooks/structure';
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
      organizational_unit_id: '',
      category: 'operational',
      budget_amount: '',
      fiscal_year: new Date().getFullYear(),
      allocation_percentage: 100,
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
        organizational_unit_id: currentItem.organizational_unit_id || '',
        category: currentItem.category || 'operational',
        budget_amount: currentItem.budget_amount || '',
        fiscal_year: currentItem.fiscal_year || new Date().getFullYear(),
        allocation_percentage: currentItem.allocation_percentage || 100,
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

  if (isLoading) {
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

        <div className="form-group">
          <label htmlFor="organizational_unit_id">Organizational Unit</label>
          <input
            id="organizational_unit_id"
            name="organizational_unit_id"
            type="text"
            placeholder="Org unit ID"
            value={values.organizational_unit_id || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span className="form-hint">Associate with an organizational unit</span>
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

        <div className="form-group">
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
          <span className="form-hint">Total budget allocation for this cost center</span>
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