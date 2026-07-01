import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useUnits, useStructureForm } from '../../../hooks/structure';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './unit.css';

export const UnitForm = () => {
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
  } = useUnits({ autoFetch: false });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useStructureForm({
    initialValues: {
      code: '',
      name: '',
      description: '',
      parent_id: '',
      cost_center_id: '',
      budget_code: '',
      headcount_limit: '',
      is_active: true,
    },
    onSubmit: async (formData) => {
      if (isEditing) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      navigate(STRUCTURE_ROUTES.UNITS);
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
        parent_id: currentItem.parent_id || '',
        cost_center_id: currentItem.cost_center_id || '',
        budget_code: currentItem.budget_code || '',
        headcount_limit: currentItem.headcount_limit || '',
        is_active: currentItem.is_active !== undefined ? currentItem.is_active : true,
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.UNITS);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="unit-form-loading">
        <StructureLoading text="Loading unit..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="unit-form-error">
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
        title="Unit Not Found"
        description="The unit you are looking for does not exist."
        actionLabel="Back to Units"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="unit-form-container">
      <div className="unit-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Unit' : 'Create Unit'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.name}` : 'New Unit'}
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
            placeholder="e.g., UNIT-001"
            value={values.code || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <span className="form-hint">Unique identifier for the unit</span>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Frontend Development"
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
            placeholder="Describe the unit's purpose and responsibilities..."
            rows="4"
            value={values.description || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="parent_id">Parent Unit</label>
          <input
            id="parent_id"
            name="parent_id"
            type="text"
            placeholder="Parent unit ID"
            value={values.parent_id || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span className="form-hint">Leave empty for root unit</span>
        </div>

        <div className="form-group">
          <label htmlFor="cost_center_id">Cost Center</label>
          <input
            id="cost_center_id"
            name="cost_center_id"
            type="text"
            placeholder="Cost center ID"
            value={values.cost_center_id || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="budget_code">Budget Code</label>
          <input
            id="budget_code"
            name="budget_code"
            type="text"
            placeholder="Budget code"
            value={values.budget_code || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="headcount_limit">Headcount Limit</label>
          <input
            id="headcount_limit"
            name="headcount_limit"
            type="number"
            placeholder="Maximum headcount"
            value={values.headcount_limit || ''}
            onChange={handleChange}
            min="0"
            disabled={isSubmitting}
          />
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
          <span className="form-hint">Inactive units will be hidden from most views</span>
        </div>
      </StructureForm>
    </div>
  );
};

export default UnitForm;