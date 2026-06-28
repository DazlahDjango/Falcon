// src/components/reviews/calibration/sessions/CalibrationSessionForm.jsx
import React, { useState, useEffect } from 'react';
import { useCycles } from '../../../../hooks/reviews';
import { useEmployees } from '../../../../hooks/accounts';
import { useDepartments } from '../../../../hooks/structure';

const CalibrationSessionForm = ({ data, onChange }) => {
  const { data: cycles, loading: cyclesLoading } = useCycles();
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: departmentsPage } = useDepartments({ page: 1, pageSize: 1000 });
  const departments = departmentsPage?.results;
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const sessionTypes = [
    { value: 'initial', label: 'Initial Calibration' },
    { value: 'mid_cycle', label: 'Mid-Cycle Review' },
    { value: 'final', label: 'Final Calibration' },
    { value: 'adhoc', label: 'Ad-Hoc Session' },
  ];

  return (
    <div className="calibration-session-form">
      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Name *</label>
        <input
          type="text"
          className="calibration-session-form-input"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter session name"
          required
        />
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Description</label>
        <textarea
          className="calibration-session-form-textarea"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="calibration-session-form-row">
        <div className="calibration-session-form-group">
          <label className="calibration-session-form-label">Review Cycle *</label>
          <select
            className="calibration-session-form-select"
            value={formData.review_cycle || ''}
            onChange={(e) => handleChange('review_cycle', e.target.value)}
            required
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
        <div className="calibration-session-form-group">
          <label className="calibration-session-form-label">Session Type</label>
          <select
            className="calibration-session-form-select"
            value={formData.session_type || 'final'}
            onChange={(e) => handleChange('session_type', e.target.value)}
          >
            {sessionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Scheduled Date *</label>
        <input
          type="datetime-local"
          className="calibration-session-form-input"
          value={formData.scheduled_date || ''}
          onChange={(e) => handleChange('scheduled_date', e.target.value)}
          required
        />
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Facilitator</label>
        <select
          className="calibration-session-form-select"
          value={formData.facilitator || ''}
          onChange={(e) => handleChange('facilitator', e.target.value)}
          disabled={employeesLoading}
        >
          <option value="">Select facilitator...</option>
          {employees?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name} ({emp.email})
            </option>
          ))}
        </select>
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Participants</label>
        <select
          className="calibration-session-form-select"
          value={formData.participants || []}
          onChange={(e) => handleChange('participants', Array.from(e.target.selectedOptions, option => option.value))}
          multiple
          disabled={employeesLoading}
        >
          {employees?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name} ({emp.email})
            </option>
          ))}
        </select>
        <span className="calibration-session-form-hint">Hold Ctrl/Cmd to select multiple participants</span>
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Departments</label>
        <select
          className="calibration-session-form-select"
          value={formData.departments_included || []}
          onChange={(e) => handleChange('departments_included', Array.from(e.target.selectedOptions, option => option.value))}
          multiple
        >
          <option value="">All Departments</option>
          {departments?.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <span className="calibration-session-form-hint">Hold Ctrl/Cmd to select multiple departments</span>
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Agenda</label>
        <textarea
          className="calibration-session-form-textarea"
          value={formData.agenda || ''}
          onChange={(e) => handleChange('agenda', e.target.value)}
          placeholder="Enter session agenda..."
          rows={4}
        />
      </div>

      <div className="calibration-session-form-group">
        <label className="calibration-session-form-label">Notes</label>
        <textarea
          className="calibration-session-form-textarea"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default CalibrationSessionForm;