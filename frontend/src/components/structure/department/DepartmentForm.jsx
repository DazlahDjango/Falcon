import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useDepartments, useDepartmentForm } from '../../../hooks/structure';
import ParentUnitSelect from '../common/ParentUnitSelect';
import UserSelector from '../../accounts/users/UserSelector';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './department.css';

export const DepartmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    create,
    update,
    clearError,
  } = useDepartments({ autoFetch: false });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useDepartmentForm({
    initialValues: {
      code: '',
      name: '',
      description: '',
      division_id: searchParams.get('division_id') || '',
      manager_id: '',
      headcount_limit: '',
      sensitivity_level: 'internal',
      is_active: true,
    },
    onSubmit: async (formData) => {
      const submitData = { ...formData };
      if (submitData.division_id === '') {
        submitData.division_id = null;
      }
      if (submitData.headcount_limit === '') {
        submitData.headcount_limit = null;
      }
      if (submitData.manager_id === '') {
        submitData.manager_id = null;
      }
      try {
        if (isEditing) {
          await update(id, submitData).unwrap();
        } else {
          await create(submitData).unwrap();
        }
        navigate(STRUCTURE_ROUTES.DEPARTMENTS);
      } catch (err) {
        console.error('API Error:', err);
        // Extract and throw the detailed error message for useStructureForm to catch
        let errMsg = 'Failed to save department.';
        if (err.data) {
          if (typeof err.data === 'string') errMsg = err.data;
          else if (err.data.code) errMsg = Array.isArray(err.data.code) ? err.data.code[0] : err.data.code;
          else if (err.data.error) errMsg = err.data.error;
          else if (Object.values(err.data).length > 0) {
            const firstErr = Object.values(err.data)[0];
            errMsg = Array.isArray(firstErr) ? firstErr[0] : firstErr;
          }
        } else if (err.message) {
          errMsg = err.message;
        }
        throw new Error(errMsg);
      }
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
        division_id: currentItem.division_id || '',
        manager_id: currentItem.manager_id || '',
        // cost_center_id and budget_code intentionally omitted
        headcount_limit: currentItem.headcount_limit || '',
        sensitivity_level: currentItem.sensitivity_level || 'internal',
        is_active: currentItem.is_active !== undefined ? currentItem.is_active : true,
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DEPARTMENTS);
  }, [navigate]);

  const sensitivityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal' },
    { value: 'confidential', label: 'Confidential' },
    { value: 'restricted', label: 'Restricted' },
  ];

  if (isEditing && isLoading) {
    return (
      <div className="department-form-loading">
        <StructureLoading text="Loading department..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-form-error">
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (isEditing && !currentItem) {
    return (
      <StructureEmptyState
        title="Department Not Found"
        description="The department you are looking for does not exist."
        actionLabel="Back to Departments"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="department-form-container">
      <div className="department-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Department' : 'Create Department'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.name}` : 'New Department'}
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
            placeholder="e.g., DEP-001"
            value={values.code || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            className={touched.code && errors.code ? 'error-input' : ''}
          />
          {touched.code && errors.code ? (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.code}</span>
          ) : (
            <span className="form-hint">3-50 characters: uppercase letters, numbers, hyphens</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Human Resources"
            value={values.name || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            className={touched.name && errors.name ? 'error-input' : ''}
          />
          {touched.name && errors.name && (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>
          )}
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the department's purpose and responsibilities..."
            rows="4"
            value={values.description || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="division_id">Parent Division</label>
          <ParentUnitSelect
            value={values.division_id}
            onChange={(v) => setFieldValue('division_id', v)}
            parentLevel="division"
            placeholder="Select division or leave blank for root department"
            disabled={isSubmitting}
          />
          <span className="form-hint">Leave empty for top-level root department</span>
        </div>

        {/* Cost center and budget code removed — not required for Departments */}

        <div className="form-group">
          <label htmlFor="manager_id">Department Manager</label>
          <UserSelector
            value={values.manager_id}
            onChange={(value) => setFieldValue('manager_id', value)}
            disabled={isSubmitting}
            className="w-full"
          />
          <span className="form-hint">Select the manager for this department</span>
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
            onBlur={handleBlur}
            min="0"
            disabled={isSubmitting}
            className={touched.headcount_limit && errors.headcount_limit ? 'error-input' : ''}
          />
          {touched.headcount_limit && errors.headcount_limit && (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.headcount_limit}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="sensitivity_level">Sensitivity Level</label>
          <select
            id="sensitivity_level"
            name="sensitivity_level"
            value={values.sensitivity_level || 'internal'}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            {sensitivityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="form-hint">Controls access visibility for this department</span>
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
          <span className="form-hint">Inactive departments will be hidden from most views</span>
        </div>
      </StructureForm>
    </div>
  );
};

export default DepartmentForm;
