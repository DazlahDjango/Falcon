// src/components/reviews/cycles/create/CycleForm.jsx
import React, { useEffect } from 'react';
import { useRatingScales } from '../../../../hooks/reviews';

const CycleForm = ({ data, onChange }) => {
  const { data: allScales = [], activeScales = [], fetchAll: fetchRatingScales } = useRatingScales();
  const ratingScales = activeScales && activeScales.length > 0 ? activeScales : allScales;

  useEffect(() => {
    fetchRatingScales();
  }, [fetchRatingScales]);

  // Auto-select standard default rating scale if available
  useEffect(() => {
    if (!data.rating_scale && ratingScales && ratingScales.length > 0) {
      const defaultScale = ratingScales.find(s => s.is_default) || ratingScales[0];
      if (defaultScale) {
        onChange({ rating_scale: defaultScale.id });
      }
    }
  }, [ratingScales, data.rating_scale, onChange]);

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const cycleTypes = [
    { value: 'annual', label: 'Annual' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'probation', label: 'Probation' },
    { value: 'special', label: 'Special' },
    { value: 'pip', label: 'PIP' },
  ];

  const totalWeight = Number(data.kpi_weight || 0) + 
                      Number(data.competency_weight || 0) + 
                      Number(data.mission_weight || 0) + 
                      Number(data.task_weight || 0);

  return (
    <div className="cycle-form">
      <h3 className="cycle-form-title">Basic Information</h3>
      
      <div className="cycle-form-group">
        <label className="cycle-form-label">Name *</label>
        <input
          type="text"
          className="cycle-form-input"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter cycle name"
          required
        />
      </div>

      <div className="cycle-form-group">
        <label className="cycle-form-label">Description</label>
        <textarea
          className="cycle-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="cycle-form-row">
        <div className="cycle-form-group">
          <label className="cycle-form-label">Cycle Type</label>
          <select
            className="cycle-form-select"
            value={data.cycle_type || 'annual'}
            onChange={(e) => handleChange('cycle_type', e.target.value)}
          >
            {cycleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cycle-form-group">
          <label className="cycle-form-label">Rating Scale *</label>
          <select
            className="cycle-form-select"
            value={data.rating_scale || ''}
            onChange={(e) => handleChange('rating_scale', e.target.value)}
            required
          >
            <option value="">Select Rating Scale...</option>
            {ratingScales.map((scale) => (
              <option key={scale.id} value={scale.id}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cycle-form-row">
        <div className="cycle-form-group">
          <label className="cycle-form-label">Start Date *</label>
          <input
            type="date"
            className="cycle-form-input"
            value={data.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            required
          />
        </div>
        <div className="cycle-form-group">
          <label className="cycle-form-label">End Date *</label>
          <input
            type="date"
            className="cycle-form-input"
            value={data.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="cycle-form-row">
        <div className="cycle-form-group">
          <label className="cycle-form-label">Self Assessment Deadline</label>
          <input
            type="date"
            className="cycle-form-input"
            value={data.self_assessment_deadline || ''}
            onChange={(e) => handleChange('self_assessment_deadline', e.target.value)}
          />
        </div>
        <div className="cycle-form-group">
          <label className="cycle-form-label">Supervisor Review Deadline</label>
          <input
            type="date"
            className="cycle-form-input"
            value={data.supervisor_review_deadline || ''}
            onChange={(e) => handleChange('supervisor_review_deadline', e.target.value)}
          />
        </div>
      </div>

      <div className="cycle-form-row">
        <div className="cycle-form-group">
          <label className="cycle-form-label">Final Approval Deadline</label>
          <input
            type="date"
            className="cycle-form-input"
            value={data.final_approval_deadline || ''}
            onChange={(e) => handleChange('final_approval_deadline', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', marginBottom: '8px' }}>
        <h3 className="cycle-form-title" style={{ margin: 0 }}>Score Weights</h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>Customizable per organization / department</span>
      </div>

      {/* Quick Preset Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => onChange({ kpi_weight: 70, competency_weight: 30, mission_weight: 0, task_weight: 0 })}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: data.kpi_weight === 70 && data.competency_weight === 30 && (data.mission_weight || 0) === 0 ? '#eff6ff' : 'white',
            color: data.kpi_weight === 70 && data.competency_weight === 30 && (data.mission_weight || 0) === 0 ? '#1d4ed8' : '#475569',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          📊 Standard (70% KPI / 30% Comp)
        </button>
        <button
          type="button"
          onClick={() => onChange({ kpi_weight: 80, competency_weight: 20, mission_weight: 0, task_weight: 0 })}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: data.kpi_weight === 80 && data.competency_weight === 20 ? '#eff6ff' : 'white',
            color: data.kpi_weight === 80 && data.competency_weight === 20 ? '#1d4ed8' : '#475569',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          💼 Sales / Target Focus (80% KPI / 20% Comp)
        </button>
        <button
          type="button"
          onClick={() => onChange({ kpi_weight: 60, competency_weight: 40, mission_weight: 0, task_weight: 0 })}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: data.kpi_weight === 60 && data.competency_weight === 40 ? '#eff6ff' : 'white',
            color: data.kpi_weight === 60 && data.competency_weight === 40 ? '#1d4ed8' : '#475569',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          🛠️ Engineering / R&D (60% KPI / 40% Comp)
        </button>
        <button
          type="button"
          onClick={() => onChange({ kpi_weight: 50, competency_weight: 30, mission_weight: 20, task_weight: 0 })}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: data.kpi_weight === 50 && data.competency_weight === 30 && data.mission_weight === 20 ? '#eff6ff' : 'white',
            color: data.kpi_weight === 50 && data.competency_weight === 30 && data.mission_weight === 20 ? '#1d4ed8' : '#475569',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          👥 Leadership (50% KPI / 30% Comp / 20% Mission)
        </button>
      </div>

      <div className="cycle-form-row">
        <div className="cycle-form-group">
          <label className="cycle-form-label">KPI Weight (%)</label>
          <input
            type="number"
            className="cycle-form-input"
            value={data.kpi_weight !== undefined ? data.kpi_weight : 70}
            onChange={(e) => handleChange('kpi_weight', Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
        <div className="cycle-form-group">
          <label className="cycle-form-label">Competency Weight (%)</label>
          <input
            type="number"
            className="cycle-form-input"
            value={data.competency_weight !== undefined ? data.competency_weight : 30}
            onChange={(e) => handleChange('competency_weight', Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
      </div>

      <div className="cycle-form-row">
        <div className="cycle-form-group">
          <label className="cycle-form-label">Mission Weight (%)</label>
          <input
            type="number"
            className="cycle-form-input"
            value={data.mission_weight || 0}
            onChange={(e) => handleChange('mission_weight', Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
        <div className="cycle-form-group">
          <label className="cycle-form-label">Task Weight (%)</label>
          <input
            type="number"
            className="cycle-form-input"
            value={data.task_weight || 0}
            onChange={(e) => handleChange('task_weight', Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Segmented Weights Visualizer */}
      <div className="cycle-weights-visualizer" style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div className="cycle-weights-visualizer-bar" style={{ display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden', background: '#e2e8f0', marginBottom: '12px' }}>
          <div 
            className="cycle-weights-segment kpi" 
            style={{ width: `${(Number(data.kpi_weight || 0) / (totalWeight || 1)) * 100}%`, background: '#3b82f6', transition: 'width 0.3s' }}
            title={`KPI: ${data.kpi_weight}%`}
          />
          <div 
            className="cycle-weights-segment competency" 
            style={{ width: `${(Number(data.competency_weight || 0) / (totalWeight || 1)) * 100}%`, background: '#10b981', transition: 'width 0.3s' }}
            title={`Competency: ${data.competency_weight}%`}
          />
          <div 
            className="cycle-weights-segment mission" 
            style={{ width: `${(Number(data.mission_weight || 0) / (totalWeight || 1)) * 100}%`, background: '#f59e0b', transition: 'width 0.3s' }}
            title={`Mission: ${data.mission_weight}%`}
          />
          <div 
            className="cycle-weights-segment task" 
            style={{ width: `${(Number(data.task_weight || 0) / (totalWeight || 1)) * 100}%`, background: '#8b5cf6', transition: 'width 0.3s' }}
            title={`Task: ${data.task_weight}%`}
          />
        </div>
        <div className="cycle-weights-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
            KPI ({data.kpi_weight || 0}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            Competency ({data.competency_weight || 0}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
            Mission ({data.mission_weight || 0}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></span>
            Task ({data.task_weight || 0}%)
          </span>
        </div>
        <div className="cycle-weights-summary" style={{ marginTop: '12px', fontSize: '13px', fontWeight: 500 }}>
          <span style={{ color: Math.abs(totalWeight - 100) < 0.1 ? '#10b981' : '#ef4444' }}>
            Total Weights: {totalWeight}% {Math.abs(totalWeight - 100) < 0.1 ? '✓ (Valid)' : '✗ (Must equal 100%)'}
          </span>
        </div>
      </div>

      <h3 className="cycle-form-title" style={{ marginTop: '24px' }}>Settings</h3>

      <div className="cycle-form-checkbox-group">
        <label className="cycle-form-checkbox">
          <input
            type="checkbox"
            checked={data.require_self_assessment || false}
            onChange={(e) => handleChange('require_self_assessment', e.target.checked)}
          />
          Require Self Assessment
        </label>
        <label className="cycle-form-checkbox">
          <input
            type="checkbox"
            checked={data.allow_self_assessment_edit || false}
            onChange={(e) => handleChange('allow_self_assessment_edit', e.target.checked)}
          />
          Allow Self Assessment Edit
        </label>
        <label className="cycle-form-checkbox">
          <input
            type="checkbox"
            checked={data.enable_calibration || false}
            onChange={(e) => handleChange('enable_calibration', e.target.checked)}
          />
          Enable Calibration
        </label>
      </div>
    </div>
  );
};

export default CycleForm;