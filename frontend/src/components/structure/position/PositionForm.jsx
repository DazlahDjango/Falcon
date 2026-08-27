import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
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
    onSubmit: async (formData, formikHelpers) => {
      console.log('[PositionForm] onSubmit triggered', { formData, activeStep });
      if (activeStep < 3) {
        if (formikHelpers && typeof formikHelpers.setSubmitting === 'function') {
          formikHelpers.setSubmitting(false);
        }
        console.log('[PositionForm] Transitioning to step:', activeStep + 1);
        setActiveStep((prev) => Math.min(prev + 1, 3));
        return;
      }
      const submitData = { ...formData };
      if (submitData.reports_to_id === '') submitData.reports_to_id = null;
      if (submitData.division_id === '') submitData.division_id = null;
      if (submitData.department_id === '') submitData.department_id = null;
      if (submitData.section_id === '') submitData.section_id = null;
      if (submitData.unit_id === '') submitData.unit_id = null;
      if (submitData.cost_center_id === '') submitData.cost_center_id = null;
      if (submitData.max_incumbents === '') submitData.max_incumbents = null;
      
      submitData.required_competencies = (submitData.required_competencies || []).map(c => 
        typeof c === 'string' ? { name: c, level: 'Required' } : c
      );
      try {
        if (isEditing) {
          await update(id, submitData);
        } else {
          await create(submitData);
        }
        navigate(STRUCTURE_ROUTES.POSITIONS);
      } catch (err) {
        console.error('API Error:', err);
        let errMsg = 'Failed to save position.';
        if (typeof err === 'string') {
          errMsg = err;
        } else if (err.data) {
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

  const [activeStep, setActiveStep] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const [competencyInput, setCompetencyInput] = useState('');

  const handleAddCompetency = (e) => {
    if (e) e.preventDefault();
    const tag = competencyInput.trim();
    if (tag && values.required_competencies && !values.required_competencies.includes(tag)) {
      setFieldValue('required_competencies', [...values.required_competencies, tag]);
    }
    setCompetencyInput('');
  };

  const handleRemoveCompetency = (tagToRemove) => {
    if (values.required_competencies) {
      setFieldValue(
        'required_competencies',
        values.required_competencies.filter((tag) => tag !== tagToRemove)
      );
    }
  };

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
        required_competencies: (currentItem.required_competencies || []).map(c => typeof c === 'object' ? c.name : c),
        is_single_incumbent: currentItem.is_single_incumbent || false,
        max_incumbents: currentItem.max_incumbents || '',
        requires_supervisor_approval: currentItem.requires_supervisor_approval !== undefined ? currentItem.requires_supervisor_approval : true,
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.POSITIONS);
  }, [navigate]);

  const handleCancelOrBack = (e) => {
    if (activeStep > 1) {
      setActiveStep((prev) => Math.max(prev - 1, 1));
    } else {
      handleCancel();
    }
  };

  const steps = [
    { number: 1, label: 'Role Info' },
    { number: 2, label: 'Placement' },
    { number: 3, label: 'Settings' }
  ];

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
        title="Position Not Found"
        description="The position you are looking for does not exist."
        actionLabel="Back to Positions"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="position-form-container" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="position-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleCancel} className="back-btn">
              <FiArrowLeft size={18} />
              Back
            </button>
            <h1>{isEditing ? 'Edit Position' : 'Create Position'}</h1>
          </div>
          <button 
            type="button" 
            onClick={() => setShowGuide(prev => !prev)} 
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            <FiInfo size={16} />
            {showGuide ? 'Hide Guide' : 'Reference Guide'}
          </button>
        </div>

        <div className="position-form-steps" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto 32px auto', maxWidth: '600px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: '#e2e8f0', zIndex: 1, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`, height: '2px', backgroundColor: '#3b82f6', zIndex: 1, transform: 'translateY(-50%)', transition: 'width 0.3s ease' }} />
          {steps.map((step) => {
            const isActive = step.number === activeStep;
            const isCompleted = step.number < activeStep;
            return (
              <div key={step.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#3b82f6' : '#ffffff',
                    border: isCompleted ? '2px solid #3b82f6' : isActive ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                    color: isCompleted ? '#ffffff' : isActive ? '#3b82f6' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.15)' : 'none',
                  }}
                >
                  {step.number}
                </div>
                <span
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#1e293b' : '#64748b',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <StructureForm
          title={isEditing ? `Editing: ${currentItem?.title}` : 'New Position'}
          onSubmit={handleSubmit}
          onCancel={handleCancelOrBack}
          cancelLabel={activeStep > 1 ? 'Back' : 'Cancel'}
          submitLabel={activeStep < 3 ? 'Next Step' : (isEditing ? 'Update Position' : 'Create Position')}
          isLoading={isSubmitting}
          isEditing={isEditing}
        >
          {activeStep === 1 && (
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
                  <span className="form-hint">e.g., M1-M3 (Managers), P1-P6 (Professionals), G1-G10 (General Staff)</span>
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
                    <span className="form-hint">1 (CEO), 2 (Executives), 3 (Department Heads), 4 (Team Leads), 5+ (Staff)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="form-section">
              <h3>Organizational Placement</h3>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
                
                <div className="form-group">
                  <label htmlFor="division_id">Division</label>
                  <ParentUnitSelect
                    value={values.division_id}
                    onChange={(v) => {
                      setFieldValue('division_id', v);
                      setFieldValue('department_id', '');
                      setFieldValue('section_id', '');
                      setFieldValue('unit_id', '');
                    }}
                    parentLevel="division"
                    placeholder="Select Division"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department_id">Department</label>
                  <ParentUnitSelect
                    value={values.department_id}
                    onChange={(v) => {
                      setFieldValue('department_id', v);
                      setFieldValue('section_id', '');
                      setFieldValue('unit_id', '');
                    }}
                    parentLevel="department"
                    placeholder="Select Department"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="section_id">Section</label>
                  <ParentUnitSelect
                    value={values.section_id}
                    onChange={(v) => {
                      setFieldValue('section_id', v);
                      setFieldValue('unit_id', '');
                    }}
                    parentLevel="section"
                    placeholder="Select Section"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unit_id">Unit</label>
                  <ParentUnitSelect
                    value={values.unit_id}
                    onChange={(v) => setFieldValue('unit_id', v)}
                    parentLevel="unit"
                    placeholder="Select Unit"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <>
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

                  <div className="form-group tag-input-group" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="competency-input">Required Competencies</label>
                    <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="competency-input"
                        type="text"
                        placeholder="Type a skill and press Enter, e.g., Python"
                        value={competencyInput}
                        onChange={(e) => setCompetencyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCompetency();
                          }
                        }}
                        disabled={isSubmitting}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddCompetency();
                        }}
                        className="btn btn-secondary"
                        disabled={isSubmitting || !competencyInput.trim()}
                        style={{ height: 'auto', padding: '8px 16px' }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      {values.required_competencies && values.required_competencies.map((tag) => (
                        <span
                          key={tag}
                          className="tag-badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '9999px',
                            padding: '4px 12px',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetency(tag)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: '#3b82f6',
                              lineHeight: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {(!values.required_competencies || values.required_competencies.length === 0) && (
                        <span className="text-gray-400 text-sm" style={{ color: '#9ca3af', fontSize: '13px' }}>No competencies added yet.</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group checkbox-group" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        name="is_single_incumbent"
                        type="checkbox"
                        checked={values.is_single_incumbent || false}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Single Incumbent Only</span>
                    </label>
                    <span className="form-hint" style={{ color: '#6b7280', fontSize: '12px', marginTop: '-8px', marginLeft: '26px' }}>Only one person can hold this position at a time</span>

                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                      <input
                        name="requires_supervisor_approval"
                        type="checkbox"
                        checked={values.requires_supervisor_approval !== false}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Requires Supervisor Approval</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </StructureForm>
      </div>

      {showGuide && (
        <div style={{
          width: '380px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '24px',
          height: 'calc(100vh - 48px)',
          position: 'sticky',
          top: '24px',
          overflowY: 'auto',
          borderRadius: '16px',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.03)',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiInfo size={20} style={{ color: '#3b82f6' }} />
            Role Mapping Guide
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
            Use this reference to correctly map hierarchy levels, compensation grades, and organizational unit placement.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>1. Hierarchy Levels (Level)</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Determines reporting tree depth. Higher numerical values must report to lower numerical values.
            </p>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '6px 0', color: '#475569' }}>Level</th>
                  <th style={{ padding: '6px 0', color: '#475569' }}>Typical Roles</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '6px 0', fontWeight: '600', color: '#1e293b' }}>1</td><td style={{ padding: '6px 0', color: '#475569' }}>CEO, Board Members</td></tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '6px 0', fontWeight: '600', color: '#1e293b' }}>2</td><td style={{ padding: '6px 0', color: '#475569' }}>VPs, C-Suite Officers (CTO, CFO)</td></tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '6px 0', fontWeight: '600', color: '#1e293b' }}>3</td><td style={{ padding: '6px 0', color: '#475569' }}>Directors, Department Heads</td></tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '6px 0', fontWeight: '600', color: '#1e293b' }}>4</td><td style={{ padding: '6px 0', color: '#475569' }}>Team Leads, Supervisors</td></tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}><td style={{ padding: '6px 0', fontWeight: '600', color: '#1e293b' }}>5+</td><td style={{ padding: '6px 0', color: '#475569' }}>Individual staff, specialists</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>2. Job Grades (Grade)</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Reflects seniority and pay bands.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>M1 - M4 (Management)</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Supervisors (M1), Managers (M2), Directors (M3), VPs (M4)</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>P1 - P8 (Professional IC)</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Junior (P1), Mid (P2), Senior (P3), Lead (P4), Principal (P5-P8)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>3. Organizational Placement</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Placement scope for position placement.
            </p>
            <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Division</strong>: VPs, General Managers, Chiefs (oversees full division)</li>
              <li><strong>Department</strong>: Directors, Heads of function, Lead HR Partners</li>
              <li><strong>Section</strong>: Branch Managers, Section Leads, Coordinators</li>
              <li><strong>Unit</strong>: Supervisors, Team Leads, Chefs, Clerks, Engineers</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionForm;
