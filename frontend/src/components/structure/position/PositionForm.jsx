import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { usePositions, usePositionForm } from '../../../hooks/structure';
import PositionSelector from '../position/PositionSelector';
import ParentUnitSelect from '../common/ParentUnitSelect';
import CostCenterSelect from '../common/CostCenterSelect';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './position.css';

export const PositionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const {
    items: positions,
    currentItem,
    isLoading,
    error,
    fetchById,
    create,
    update,
    clearError,
  } = usePositions({ autoFetch: true, params: { page: 1, pageSize: 1000 } });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = usePositionForm({
    initialValues: {
      job_code: '',
      title: '',
      grade: '',
      level: 5,
      reports_to_id: '',
      division_id: '',
      department_id: '',
      section_id: '',
      unit_id: '',
      cost_center_id: '',
      fte: 1.0,
      min_tenure_months: 0,
      required_competencies: [],
      is_single_incumbent: false,
      max_incumbents: '',
      requires_supervisor_approval: true,
    },
    onSubmit: async (formData) => {
      const submitData = { ...formData };
      if (submitData.reports_to_id === '') {
        submitData.reports_to_id = null;
      }
      if (submitData.max_incumbents === '') {
        submitData.max_incumbents = null;
      }
      try {
        if (isEditing) {
          await update(id, submitData).unwrap();
        } else {
          await create(submitData).unwrap();
        }
        navigate(STRUCTURE_ROUTES.POSITIONS);
      } catch (err) {
        console.error('API Error:', err);
        let errMsg = 'Failed to save position.';
        if (err.data) {
          if (typeof err.data === 'string') errMsg = err.data;
          else if (err.data.code) errMsg = Array.isArray(err.data.code) ? err.data.code[0] : err.data.code;
          else if (err.data.job_code) errMsg = Array.isArray(err.data.job_code) ? err.data.job_code[0] : err.data.job_code;
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
        job_code: currentItem.job_code || '',
        title: currentItem.title || '',
        grade: currentItem.grade || '',
        level: currentItem.level || 5,
        reports_to_id: currentItem.reports_to_id || '',
        division_id: currentItem.division_id || '',
        department_id: currentItem.department_id || '',
        section_id: currentItem.section_id || '',
        unit_id: currentItem.unit_id || '',
        cost_center_id: currentItem.cost_center_id || '',
        fte: currentItem.fte || 1.0,
        min_tenure_months: currentItem.min_tenure_months || 0,
        required_competencies: currentItem.required_competencies || [],
        is_single_incumbent: currentItem.is_single_incumbent || false,
        max_incumbents: currentItem.max_incumbents || '',
        requires_supervisor_approval: currentItem.requires_supervisor_approval !== undefined ? currentItem.requires_supervisor_approval : true,
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITIONS);
  }, [navigate]);

  if (isEditing && isLoading) {
    return (
      <div className="position-form-loading">
        <StructureLoading text="Loading position..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="position-form-error">
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
        title="Position Not Found"
        description="The position you are looking for does not exist."
        actionLabel="Back to Positions"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="position-form-container">
      <div className="position-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Position' : 'Create Position'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.title}` : 'New Position'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={isEditing}
      >
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
          <label htmlFor="job_code">
            Job Code <span className="required">*</span>
          </label>
          <input
            id="job_code"
            name="job_code"
            type="text"
            placeholder="e.g., ENG-001"
            value={values.job_code || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            className={touched.job_code && errors.job_code ? 'error-input' : ''}
          />
          {touched.job_code && errors.job_code ? (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.job_code}</span>
          ) : (
            <span className="form-hint">Format: 2-4 letters, hyphen, 3-5 digits (e.g., ENG-001)</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g., Senior Software Engineer"
            value={values.title || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            className={touched.title && errors.title ? 'error-input' : ''}
          />
          {touched.title && errors.title && (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="grade">Grade</label>
          <input
            id="grade"
            name="grade"
            type="text"
            placeholder="e.g., P5"
            value={values.grade || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="level">
            Level <span className="required">*</span>
          </label>
          <input
            id="level"
            name="level"
            type="number"
            placeholder="1-20"
            value={values.level || 5}
            onChange={handleChange}
            onBlur={handleBlur}
            min="1"
            max="20"
            required
            disabled={isSubmitting}
            className={touched.level && errors.level ? 'error-input' : ''}
          />
          {touched.level && errors.level ? (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.level}</span>
          ) : (
            <span className="form-hint">Must be between 1 and 20</span>
          )}
        </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Organizational Placement</h3>
          <div className="form-grid">
            <div className="form-group">
          <label htmlFor="reports_to_id">Reports To Position</label>
          <PositionSelector
            value={values.reports_to_id}
            onChange={(value) => setFieldValue('reports_to_id', value)}
            positions={positions}
            placeholder="Select reporting position"
            disabled={isSubmitting}
            className="w-full"
          />
          <span className="form-hint">Leave empty for top-level position</span>
        </div>
        
            <ParentUnitSelect
              values={values}
              setFieldValue={setFieldValue}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Financials & Headcount</h3>
          <div className="form-grid">
            <div className="form-group">
          <div style={{ flex: 1 }}>
            <label htmlFor="cost_center_id">Cost Center</label>
            <CostCenterSelect
              value={values.cost_center_id}
              onChange={(v) => setFieldValue('cost_center_id', v)}
              placeholder="Select Cost Center"
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="fte">FTE (Full-Time Equivalent)</label>
            <input
              id="fte"
              name="fte"
              type="number"
              step="0.01"
              min="0"
              value={values.fte || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="form-hint">e.g. 1.0 for full-time, 0.5 for part-time</span>
            </div>
          </div>
        </div>
        </div>

        <div className="form-section">
          <h3>Requirements & Settings</h3>
          <div className="form-grid">
            <div className="form-group">
          <label htmlFor="min_tenure_months">Minimum Tenure (months)</label>
          <input
            id="min_tenure_months"
            name="min_tenure_months"
            type="number"
            placeholder="0"
            value={values.min_tenure_months || 0}
            onChange={handleChange}
            min="0"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="max_incumbents">Maximum Incumbents</label>
          <input
            id="max_incumbents"
            name="max_incumbents"
            type="number"
            placeholder="Leave empty for unlimited"
            value={values.max_incumbents || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            min="1"
            disabled={isSubmitting}
            className={touched.max_incumbents && errors.max_incumbents ? 'error-input' : ''}
          />
          {touched.max_incumbents && errors.max_incumbents ? (
            <span className="form-error" style={{ color: 'var(--text-danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.max_incumbents}</span>
          ) : (
            <span className="form-hint">Number of people who can hold this position</span>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_single_incumbent"
              type="checkbox"
              checked={values.is_single_incumbent || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Single Incumbent Only</span>
          </label>
          <span className="form-hint">Only one person can hold this position</span>
        </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  name="requires_supervisor_approval"
                  type="checkbox"
                  checked={values.requires_supervisor_approval !== false}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span>Requires Supervisor Approval</span>
              </label>
            </div>
          </div>
        </div>
      </StructureForm>
    </div>
  );
};

export default PositionForm;
