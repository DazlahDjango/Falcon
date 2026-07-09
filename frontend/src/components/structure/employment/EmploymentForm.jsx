import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiBriefcase, FiCalendar } from 'react-icons/fi';
import { useEmployments, useEmploymentForm, usePositions } from '../../../hooks/structure';
import UserSelector from '../../accounts/users/UserSelector';
import PositionSelector from '../position/PositionSelector';
import DepartmentSelector from '../department/DepartmentSelector';
import ParentUnitSelect from '../common/ParentUnitSelect';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './employment.css';

export const EmploymentForm = () => {
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
  } = useEmployments({ autoFetch: false });

  const { items: positions = [] } = usePositions();

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useEmploymentForm({
    initialValues: {
      user_id: '',
      position_id: '',
      
      
      
      
      employment_type: 'permanent',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      is_manager: false,
      is_executive: false,
      is_board_member: false,
      is_team_lead: false,
      change_reason: '',
    },
    onSubmit: async (formData) => {
      const cleanData = { ...formData };
      
      // Convert empty strings to null for optional UUID and Date fields
      const optionalFields = ['effective_to'];
      optionalFields.forEach(field => {
        if (cleanData[field] === '') {
          cleanData[field] = null;
        }
      });

      if (isEditing) {
        await update(id, cleanData).unwrap();
      } else {
        await create(cleanData).unwrap();
      }
      navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
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
        user_id: currentItem.user_id || '',
        position_id: currentItem.position_id || '',
        
        
        
        
        employment_type: currentItem.employment_type || 'permanent',
        effective_from: currentItem.effective_from || new Date().toISOString().split('T')[0],
        effective_to: currentItem.effective_to || '',
        is_manager: currentItem.is_manager || false,
        is_executive: currentItem.is_executive || false,
        is_board_member: currentItem.is_board_member || false,
        is_team_lead: currentItem.is_team_lead || false,
        change_reason: currentItem.change_reason || '',
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  }, [navigate]);

  const employmentTypes = [
    { value: 'permanent', label: 'Permanent' },
    { value: 'contract', label: 'Contract' },
    { value: 'probation', label: 'Probation' },
    { value: 'intern', label: 'Intern' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'temporary', label: 'Temporary' },
  ];

  if (isEditing && isLoading) {
    return (
      <div className="employment-form-loading">
        <StructureLoading text="Loading employment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employment-form-error">
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
        title="Employment Not Found"
        description="The employment record you are looking for does not exist."
        actionLabel="Back to Employments"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="employment-form-container">
      <div className="employment-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Employment' : 'Create Employment'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.user_name || 'Employment'}` : 'New Employment'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={isEditing}
      >
        <div className="form-group">
          <label htmlFor="user_id">
            User <span className="required">*</span>
          </label>
          <UserSelector
            value={values.user_id}
            onChange={(value) => setFieldValue('user_id', value)}
            disabled={isEditing || isSubmitting}
            className={`w-full ${touched.user_id && errors.user_id ? 'error-input' : ''}`}
          />
          {touched.user_id && errors.user_id ? (
            <span className="form-error" style={{ color: 'var(--danger-600)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.user_id}</span>
          ) : (
            <span className="form-hint">Select the user for this employment</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="position_id">
            Position <span className="required">*</span>
          </label>
          <PositionSelector
            value={values.position_id}
            onChange={(value) => setFieldValue('position_id', value)}
            positions={positions}
            placeholder="Select position"
            className={`w-full ${touched.position_id && errors.position_id ? 'error-input' : ''}`}
          />
          {touched.position_id && errors.position_id ? (
            <span className="form-error" style={{ color: 'var(--danger-600)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.position_id}</span>
          ) : (
            <span className="form-hint">Choose the role assigned to the employee</span>
          )}
        </div>



        <div className="form-group">
          <label htmlFor="employment_type">
            Employment Type <span className="required">*</span>
          </label>
          <select
            id="employment_type"
            name="employment_type"
            value={values.employment_type || 'permanent'}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {employmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="effective_from">
            Effective From <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <FiCalendar className="input-icon" size={16} />
            <input
              id="effective_from"
              name="effective_from"
              type="date"
              value={values.effective_from || ''}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={touched.effective_from && errors.effective_from ? 'error-input' : ''}
            />
          </div>
          {touched.effective_from && errors.effective_from && (
            <span className="form-error" style={{ color: 'var(--danger-600)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.effective_from}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="effective_to">Effective To</label>
          <div className="input-with-icon">
            <FiCalendar className="input-icon" size={16} />
            <input
              id="effective_to"
              name="effective_to"
              type="date"
              value={values.effective_to || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              className={touched.effective_to && errors.effective_to ? 'error-input' : ''}
            />
          </div>
          {touched.effective_to && errors.effective_to ? (
            <span className="form-error" style={{ color: 'var(--danger-600)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.effective_to}</span>
          ) : (
            <span className="form-hint">Leave empty for current/ongoing employment</span>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_manager"
              type="checkbox"
              checked={values.is_manager || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Is Manager</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_executive"
              type="checkbox"
              checked={values.is_executive || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Is Executive</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_board_member"
              type="checkbox"
              checked={values.is_board_member || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Is Board Member</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_team_lead"
              type="checkbox"
              checked={values.is_team_lead || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Is Team Lead</span>
          </label>
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="change_reason">Change Reason</label>
          <textarea
            id="change_reason"
            name="change_reason"
            placeholder="Reason for employment change..."
            rows="3"
            value={values.change_reason || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </StructureForm>
    </div>
  );
};

export default EmploymentForm;
