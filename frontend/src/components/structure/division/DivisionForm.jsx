import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiLayers, FiTarget, FiUsers, FiInfo } from 'react-icons/fi';
import { useDivisions, useDivisionForm } from '../../../hooks/structure';
import UserSelector from '../../accounts/users/UserSelector';
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

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useDivisionForm({
    initialValues: {
      code: '',
      name: '',
      description: '',
      director_id: '',
      headcount_limit: '',
      is_active: true,
    },
    onSubmit: async (formData) => {
      const submitData = { ...formData };
      if (submitData.director_id === '') {
        submitData.director_id = null;
      }
      if (submitData.headcount_limit === '') {
        submitData.headcount_limit = null;
      }
      if (isEditing) {
        await update(id, submitData).unwrap();
      } else {
        await create(submitData).unwrap();
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
        director_id: currentItem.director_id || '',
        headcount_limit: currentItem.headcount_limit || '',
        is_active: currentItem.is_active !== undefined ? currentItem.is_active : true,
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DIVISIONS);
  }, [navigate]);

  if (isEditing && isLoading) {
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

      <div className="division-form-hero">
        <div className="division-form-hero__content">
          <div className="division-form-hero__icon">
            <FiLayers size={20} />
          </div>
          <div>
            <p className="division-form-hero__eyebrow">Strategic unit setup</p>
            <h2>{isEditing ? 'Refine this division' : 'Create a division that teams can follow'}</h2>
            <p>Give each division a clear identity, sensible headcount scope, and an active status that reflects how it should appear across the organization.</p>
          </div>
        </div>
        <div className="division-form-hero__tips">
          <div className="division-form-tip">
            <FiTarget size={16} />
            Keep names concise and role-based
          </div>
          <div className="division-form-tip">
            <FiUsers size={16} />
            Set a headcount limit to guide staffing
          </div>
          <div className="division-form-tip">
            <FiInfo size={16} />
            Use active/inactive to control visibility
          </div>
        </div>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.name}` : 'New Division'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={isEditing}
      >
        <div className="division-form-section">
          <div className="division-form-section__title">Basic details</div>
          <div className="division-form-grid">
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
        </div>

        <div className="division-form-section">
          <div className="division-form-section__title">Configuration</div>
          <div className="division-form-grid">
            <div className="form-group">
              <label htmlFor="director_id">Division Director</label>
              <UserSelector
                value={values.director_id}
                onChange={(value) => setFieldValue('director_id', value)}
                disabled={isSubmitting}
                className="w-full"
              />
              <span className="form-hint">Select the director for this division</span>
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
          </div>
        </div>
      </StructureForm>
    </div>
  );
};

export default DivisionForm;
