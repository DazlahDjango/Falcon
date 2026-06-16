// src/components/reviews/cycles/create/CycleForm.jsx
import React from 'react';

const CycleForm = ({ data, onChange }) => {
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
          <label className="cycle-form-label">KPI Weight (%)</label>
          <input
            type="number"
            className="cycle-form-input"
            value={data.kpi_weight || 70}
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
            value={data.competency_weight || 30}
            onChange={(e) => handleChange('competency_weight', Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
      </div>

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