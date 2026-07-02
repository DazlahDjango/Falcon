import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiUsers, FiCalendar } from 'react-icons/fi';
import { useReportingLines, useStructureForm, useEmployments } from '../../../hooks/structure';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './reporting.css';

export const ReportingLineForm = () => {
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
  } = useReportingLines({ autoFetch: false });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useStructureForm({
    initialValues: {
      employee_id: '',
      manager_id: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      change_reason: '',
    },
    onSubmit: async (formData) => {
      if (isEditing) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      navigate(STRUCTURE_ROUTES.REPORTING_LINES);
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
        manager_id: currentItem.manager_id || '',
        effective_from: currentItem.effective_from || new Date().toISOString().split('T')[0],
        effective_to: currentItem.effective_to || '',
        change_reason: currentItem.change_reason || '',
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const { items: employments } = useEmployments({ autoFetch: true, params: { filters: { is_current: 'true' }, page: 1, pageSize: 1000 } });

  const employeeOptions = useMemo(
    () => employments?.map((employment) => ({
      value: employment.id,
      label: `${employment.user_name || employment.user_id} • ${employment.position?.title || employment.position_id || 'No position'}`,
    })) || [],
    [employments],
  );

  const managerOptions = useMemo(
    () => employments
      ?.filter((employment) => employment.is_manager || employment.is_executive)
      .map((employment) => ({
        value: employment.id,
        label: `${employment.user_name || employment.user_id} • ${employment.position?.title || employment.position_id || 'Manager'}`,
      })) || [],
    [employments],
  );

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINES);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="reporting-form-loading">
        <StructureLoading text="Loading reporting line..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporting-form-error">
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
        title="Reporting Line Not Found"
        description="The reporting line you are looking for does not exist."
        actionLabel="Back to Reporting Lines"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="reporting-form-container">
      <div className="reporting-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Reporting Line' : 'Create Reporting Line'}</h1>
      </div>

      <StructureForm
        title={isEditing ? 'Edit Reporting Line' : 'New Reporting Line'}
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
            disabled={isEditing || isSubmitting}
          >
            <option value="">Select employee</option>
            {employeeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="form-hint">Select the employee for this reporting line</span>
        </div>

        <div className="form-group">
          <label htmlFor="manager_id">
            Manager <span className="required">*</span>
          </label>
          <select
            id="manager_id"
            name="manager_id"
            value={values.manager_id || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="">Select manager</option>
            {managerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="form-hint">Select the manager for this reporting line</span>
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
            />
          </div>
          <span className="form-hint">Leave empty for current/ongoing reporting relationship</span>
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="change_reason">Change Reason</label>
          <textarea
            id="change_reason"
            name="change_reason"
            placeholder="Reason for this reporting line change..."
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

export default ReportingLineForm;