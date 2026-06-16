// src/components/reviews/pips/create/PIPForm.jsx
import React, { useState, useEffect } from 'react';
import { useEmployees } from '../../../../hooks/accounts';
import { useCycles } from '../../../../hooks/reviews';

const PIPForm = ({ data, onChange }) => {
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: cycles, loading: cyclesLoading } = useCycles();
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const severityOptions = [
    { value: 'minor', label: 'Minor - Coaching Required' },
    { value: 'moderate', label: 'Moderate - Formal PIP' },
    { value: 'severe', label: 'Severe - Final Warning' },
    { value: 'critical', label: 'Critical - Possible Termination' },
  ];

  return (
    <div className="pip-form">
      <h3 className="pip-form-title">PIP Information</h3>

      <div className="pip-form-group">
        <label className="pip-form-label">Title *</label>
        <input
          type="text"
          className="pip-form-input"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter PIP title"
          required
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Description</label>
        <textarea
          className="pip-form-textarea"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="pip-form-row">
        <div className="pip-form-group">
          <label className="pip-form-label">Employee *</label>
          <select
            className="pip-form-select"
            value={formData.employee || ''}
            onChange={(e) => handleChange('employee', e.target.value)}
            required
            disabled={employeesLoading}
          >
            <option value="">Select employee...</option>
            {employees?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.email})
              </option>
            ))}
          </select>
        </div>
        <div className="pip-form-group">
          <label className="pip-form-label">Owner</label>
          <select
            className="pip-form-select"
            value={formData.owner || ''}
            onChange={(e) => handleChange('owner', e.target.value)}
            disabled={employeesLoading}
          >
            <option value="">Select owner...</option>
            {employees?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Review Cycle</label>
        <select
          className="pip-form-select"
          value={formData.review_cycle || ''}
          onChange={(e) => handleChange('review_cycle', e.target.value)}
          disabled={cyclesLoading}
        >
          <option value="">Select review cycle...</option>
          {cycles?.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Severity</label>
        <select
          className="pip-form-select"
          value={formData.severity || 'moderate'}
          onChange={(e) => handleChange('severity', e.target.value)}
        >
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pip-form-row">
        <div className="pip-form-group">
          <label className="pip-form-label">Start Date *</label>
          <input
            type="date"
            className="pip-form-input"
            value={formData.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            required
          />
        </div>
        <div className="pip-form-group">
          <label className="pip-form-label">End Date *</label>
          <input
            type="date"
            className="pip-form-input"
            value={formData.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Improvement Areas</label>
        <textarea
          className="pip-form-textarea"
          value={formData.improvement_areas || ''}
          onChange={(e) => handleChange('improvement_areas', e.target.value)}
          placeholder="What areas need improvement?"
          rows={3}
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Success Criteria</label>
        <textarea
          className="pip-form-textarea"
          value={formData.success_criteria || ''}
          onChange={(e) => handleChange('success_criteria', e.target.value)}
          placeholder="What defines success?"
          rows={3}
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Consequences if Failed</label>
        <textarea
          className="pip-form-textarea"
          value={formData.consequences_if_failed || ''}
          onChange={(e) => handleChange('consequences_if_failed', e.target.value)}
          placeholder="What happens if the PIP fails?"
          rows={2}
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Consequences if Successful</label>
        <textarea
          className="pip-form-textarea"
          value={formData.consequences_if_successful || ''}
          onChange={(e) => handleChange('consequences_if_successful', e.target.value)}
          placeholder="What happens if the PIP succeeds?"
          rows={2}
        />
      </div>
    </div>
  );
};

export default PIPForm;