// src/components/reviews/feedback/requests/FeedbackRequestForm.jsx
import React, { useState, useEffect } from 'react';
import { useEmployees } from '../../../../hooks/accounts';
import { useCycles } from '../../../../hooks/reviews';

const FeedbackRequestForm = ({ data, onChange }) => {
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: cycles, loading: cyclesLoading } = useCycles();
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const reviewerTypes = [
    { value: 'manager', label: 'Direct Manager' },
    { value: 'peer', label: 'Peer' },
    { value: 'subordinate', label: 'Subordinate' },
    { value: 'cross_dept', label: 'Cross-Department' },
    { value: 'external', label: 'External (Client/Partner)' },
  ];

  return (
    <div className="feedback-request-form">
      <div className="feedback-request-form-group">
        <label className="feedback-request-form-label">Subject (Employee) *</label>
        <select
          className="feedback-request-form-select"
          value={formData.subject || ''}
          onChange={(e) => handleChange('subject', e.target.value)}
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

      <div className="feedback-request-form-group">
        <label className="feedback-request-form-label">Reviewer *</label>
        <select
          className="feedback-request-form-select"
          value={formData.reviewer || ''}
          onChange={(e) => handleChange('reviewer', e.target.value)}
          required
          disabled={employeesLoading}
        >
          <option value="">Select reviewer...</option>
          {employees?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name} ({emp.email})
            </option>
          ))}
        </select>
      </div>

      <div className="feedback-request-form-group">
        <label className="feedback-request-form-label">Review Cycle *</label>
        <select
          className="feedback-request-form-select"
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

      <div className="feedback-request-form-group">
        <label className="feedback-request-form-label">Reviewer Type</label>
        <select
          className="feedback-request-form-select"
          value={formData.reviewer_type || 'peer'}
          onChange={(e) => handleChange('reviewer_type', e.target.value)}
        >
          {reviewerTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="feedback-request-form-group">
        <label className="feedback-request-form-label">Due Date *</label>
        <input
          type="date"
          className="feedback-request-form-input"
          value={formData.due_date || ''}
          onChange={(e) => handleChange('due_date', e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="feedback-request-form-checkbox-group">
        <label className="feedback-request-form-checkbox">
          <input
            type="checkbox"
            checked={formData.is_anonymous || false}
            onChange={(e) => handleChange('is_anonymous', e.target.checked)}
          />
          Anonymous Response
        </label>
        <label className="feedback-request-form-checkbox">
          <input
            type="checkbox"
            checked={formData.is_required || false}
            onChange={(e) => handleChange('is_required', e.target.checked)}
          />
          Required Response
        </label>
      </div>
    </div>
  );
};

export default FeedbackRequestForm;