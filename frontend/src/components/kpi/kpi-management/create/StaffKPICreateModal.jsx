import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiCheck, FiInfo, FiTarget, FiClock, FiActivity } from 'react-icons/fi';
import { createKPI, fetchCategories, selectCategories, selectKPISubmitting, selectKPIError } from '../../../../store/kpi';
import UnitSelector from '../../common/UnitSelector';
import './create.css';

const StaffKPICreateModal = ({ onComplete, onCancel }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories) || [];
  const submitting = useSelector(selectKPISubmitting);
  const serverError = useSelector(selectKPIError);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    kpiType: 'COUNT',
    unit: '',
    baseline: '',
    targetValue: '',
    parentKpiId: '',
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Performance Indicator Name is required');
      return;
    }
    if (!formData.kpiType) {
      setValidationError('Performance Indicator Type is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId || null,
      kpiType: formData.kpiType,
      unit: formData.unit.trim() || 'Units',
      baseline: formData.baseline !== '' ? formData.baseline : null,
      targetValue: formData.targetValue !== '' ? formData.targetValue : null,
      parentKpiId: formData.parentKpiId || null,
      isStaffCreated: true,
    };

    try {
      const result = await dispatch(createKPI(payload)).unwrap();
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Failed to create staff KPI:', err);
    }
  };

  const isTimeMetric = formData.kpiType === 'TIME' || formData.unit.toLowerCase().includes('hour') || formData.unit.toLowerCase().includes('min');

  return (
    <div className="kpi-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="kpi-modal-container" style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <FiTarget size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                Propose Operational Performance Indicator
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Set your personal work measure and target for supervisor approval
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {(validationError || serverError) && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}>
              {validationError || (typeof serverError === 'string' ? serverError : JSON.stringify(serverError))}
            </div>
          )}

          {/* Helper Badge */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: isTimeMetric ? '#f0f9ff' : '#f8fafc',
            border: isTimeMetric ? '1px solid #bae6fd' : '1px solid #e2e8f0',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            {isTimeMetric ? <FiClock size={18} color="#0284c7" style={{ marginTop: '2px' }} /> : <FiInfo size={18} color="#64748b" style={{ marginTop: '2px' }} />}
            <div style={{ fontSize: '0.825rem', color: isTimeMetric ? '#0369a1' : '#475569', lineHeight: '1.4' }}>
              {isTimeMetric ? (
                <span><strong>Time & Latency Metric:</strong> The system automatically evaluates <em>Lower is Better</em>. Resolving tasks faster or reducing turnaround hours yields a higher score.</span>
              ) : (
                <span><strong>Auto-Scored Performance Indicator:</strong> Your supervisor will review and approve this Performance Indicator. Phasing will automatically split your target across 12 months equal split.</span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.1rem' }}>
            {/* KPI Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Performance Indicator Name / Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Daily Guard Shift On-Time Start / Ticket Resolution Time"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Description / Purpose
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Briefly describe what this operational measure tracks day-to-day..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Category & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Key Result Area
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">Select Key Result Area...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Performance Indicator Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="kpiType"
                  value={formData.kpiType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="COUNT">Count / Quantity</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FINANCIAL">Financial Amount</option>
                  <option value="TIME">Time / Turnaround Hours</option>
                  <option value="MILESTONE">Yes/No Milestone</option>
                  <option value="IMPACT">Impact Rating Score</option>
                </select>
              </div>
            </div>

            {/* Unit & Baseline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Unit of Measure
                </label>
                <UnitSelector
                  kpiType={formData.kpiType}
                  value={formData.unit}
                  onChange={(newUnit) => setFormData(prev => ({ ...prev, unit: newUnit }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Baseline (Previous Benchmark)
                </label>
                <input
                  type="number"
                  step="any"
                  name="baseline"
                  value={formData.baseline}
                  onChange={handleChange}
                  placeholder="e.g. 4.50"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* Target Value */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Annual Fixed Target Value
              </label>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  type="number"
                  step="any"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  placeholder="e.g. 2.00 or 120"
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px 0 0 8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                <div style={{
                  padding: '0.65rem 1rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderLeft: 'none',
                  borderRadius: '0 8px 8px 0',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#334155',
                  minWidth: '65px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box'
                }}>
                  {formData.unit || '%'}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                This single target will be split equally into 12 monthly targets automatically.
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>Submit for Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffKPICreateModal;
