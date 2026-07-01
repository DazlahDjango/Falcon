import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useDivisions, useStructureForm } from '../../../hooks/structure';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './division.css';

export const DivisionForm = () => {
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
  } = useDivisions({ autoFetch: false });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useStructureForm({
    initialValues: {
      code: '',
      name: '',
      description: '',
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
      navigate(STRUCTURE_ROUTES.DIVISIONS);
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
        cost_center_id: currentItem.cost_center_id || '',
        budget_code: currentItem.budget_code || '',
        headcount_limit: currentItem.headcount_limit || '',
        is_active: currentItem.is_active !== undefined ? currentItem.is_active : true,
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DIVISIONS);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="division-form-loading">
        <StructureLoading text="Loading division..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="division-form-error">
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
        title="Division Not Found"
        description="The division you are looking for does not exist."
        actionLabel="Back to Divisions"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="division-form-container">
      <div className="division-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Division' : 'Create Division'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.name}` : 'New Division'}
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
            placeholder="e.g., DIV-001"
            value={values.code || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <span className="form-hint">Unique identifier for the division</span>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Corporate Strategy"
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
            placeholder="Describe the division's purpose and responsibilities..."
            rows="4"
            value={values.description || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
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
          <span className="form-hint">Inactive divisions will be hidden from most views</span>
        </div>
      </StructureForm>
    </div>
  );
};

export default DivisionForm;