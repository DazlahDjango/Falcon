import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { useInterimAssignments, useStructureForm } from '../../../hooks/structure';
import { useEmployments } from '../../../hooks/structure'; // Add this import
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './interim.css';

export const InterimAssignmentForm = () => {
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
  } = useInterimAssignments({ autoFetch: false });

  // Fetch employments for the dropdowns
  const { items: employments, isLoading: isLoadingEmployments } = useEmployments({ 
    autoFetch: true, 
    params: { filters: { is_current: 'true' }, page: 1, pageSize: 1000 } 
  });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useStructureForm({
    initialValues: {
      employee_id: '',
      interim_manager_id: '',
      reporting_type: 'interim',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      reason: '',
      notes: '',
    },
    onSubmit: async (formData) => {
      if (isEditing) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS);
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
        employee_id: currentItem.employee_id || '',
        interim_manager_id: currentItem.interim_manager_id || '',
        reporting_type: currentItem.reporting_type || 'interim',
        effective_from: currentItem.effective_from || new Date().toISOString().split('T')[0],
        effective_to: currentItem.effective_to || '',
        reason: currentItem.reason || '',
        notes: currentItem.notes || '',
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS);
  }, [navigate]);

  const reportingTypes = [
    { value: 'interim', label: 'Interim' },
    { value: 'dotted', label: 'Dotted Line' },
    { value: 'functional', label: 'Functional' },
    { value: 'project', label: 'Project' },
  ];

  // Show loading while fetching interim assignment or employments
  if ((isEditing && isLoading) || isLoadingEmployments) {
    return (
      <div className="interim-form-loading">
        <StructureLoading text="Loading interim assignment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="interim-form-error">
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
        title="Interim Assignment Not Found"
        description="The interim assignment you are looking for does not exist."
        actionLabel="Back to Interim Assignments"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="interim-form-container">
      <div className="interim-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Interim Assignment' : 'Create Interim Assignment'}</h1>
      </div>

      <StructureForm
        title={isEditing ? 'Edit Interim Assignment' : 'New Interim Assignment'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={isEditing}
      >
        <div className="form-group">
          <label htmlFor="employee_id">
            Employee <span className="required">*</span>
          </label>
          <select
            id="employee_id"
            name="employee_id"
            value={values.employee_id || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting || isLoadingEmployments}
          >
            <option value="">Select employee</option>
            {employments && employments.length > 0 ? (
              employments.map((employment) => (
                <option key={employment.id} value={employment.id}>
                  {employment.user_name || employment.user_id} • {employment.position?.title || employment.position_id}
                </option>
              ))
            ) : (
              <option value="" disabled>No employees available</option>
            )}
          </select>
          <span className="form-hint">The employment ID of the employee receiving interim management</span>
        </div>

        <div className="form-group">
          <label htmlFor="interim_manager_id">
            Interim Manager <span className="required">*</span>
          </label>
          <select
            id="interim_manager_id"
            name="interim_manager_id"
            value={values.interim_manager_id || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting || isLoadingEmployments}
          >
            <option value="">Select interim manager</option>
            {employments && employments.length > 0 ? (
              employments.map((employment) => (
                <option key={employment.id} value={employment.id}>
                  {employment.user_name || employment.user_id} • {employment.position?.title || employment.position_id}
                </option>
              ))
            ) : (
              <option value="" disabled>No employees available</option>
            )}
          </select>
          <span className="form-hint">The employment ID of the interim manager</span>
        </div>

        <div className="form-group">
          <label htmlFor="reporting_type">
            Reporting Type <span className="required">*</span>
          </label>
          <select
            id="reporting_type"
            name="reporting_type"
            value={values.reporting_type || 'interim'}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {reportingTypes.map((type) => (
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
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="effective_to">
            Effective To <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <FiCalendar className="input-icon" size={16} />
            <input
              id="effective_to"
              name="effective_to"
              type="date"
              value={values.effective_to || ''}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <span className="form-hint">Interim assignments must have an end date</span>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <input
            id="reason"
            name="reason"
            type="text"
            placeholder="Reason for interim assignment"
            value={values.reason || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Additional notes about this interim assignment..."
            rows="3"
            value={values.notes || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </StructureForm>
    </div>
  );
};

export default InterimAssignmentForm;
