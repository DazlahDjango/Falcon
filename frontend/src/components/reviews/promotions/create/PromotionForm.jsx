// src/components/reviews/promotions/create/PromotionForm.jsx
import React, { useState, useEffect } from 'react';
import { useEmployees } from '../../../../hooks/accounts';
import { useCycles, useFinalRating } from '../../../../hooks/reviews';

const PromotionForm = ({ data, onChange }) => {
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: cycles, loading: cyclesLoading } = useCycles();
  const { data: ratings, fetchForCycle } = useFinalRating();
  const [formData, setFormData] = useState(data);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees?.find(e => e.id === employeeId);
    setSelectedEmployee(employeeId);
    handleChange('employee', employeeId);
    if (employee) {
      handleChange('current_role', employee.position?.title || '');
      handleChange('current_level', employee.position?.level || '');
      handleChange('current_salary', employee.salary || '');
    }
  };

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'urgent', label: 'Urgent' },
  ];

  useEffect(() => {
    if (formData.review_cycle) {
      fetchForCycle(formData.review_cycle);
    }
  }, [formData.review_cycle, fetchForCycle]);

  return (
    <div className="promotion-form">
      <div className="promotion-form-group">
        <label className="promotion-form-label">Employee *</label>
        <select
          className="promotion-form-select"
          value={formData.employee || ''}
          onChange={(e) => handleEmployeeChange(e.target.value)}
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

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Review Cycle</label>
          <select
            className="promotion-form-select"
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
        <div className="promotion-form-group">
          <label className="promotion-form-label">Final Rating</label>
          <select
            className="promotion-form-select"
            value={formData.final_rating || ''}
            onChange={(e) => handleChange('final_rating', e.target.value)}
            disabled={!formData.review_cycle}
          >
            <option value="">Select final rating...</option>
            {ratings?.map((rating) => (
              <option key={rating.id} value={rating.id}>
                {rating.employee_name} - {rating.final_score}%
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Current Role</label>
          <input
            type="text"
            className="promotion-form-input"
            value={formData.current_role || ''}
            onChange={(e) => handleChange('current_role', e.target.value)}
            placeholder="Current role"
          />
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Current Level</label>
          <input
            type="text"
            className="promotion-form-input"
            value={formData.current_level || ''}
            onChange={(e) => handleChange('current_level', e.target.value)}
            placeholder="Current level"
          />
        </div>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Recommended Role *</label>
          <input
            type="text"
            className="promotion-form-input"
            value={formData.recommended_role || ''}
            onChange={(e) => handleChange('recommended_role', e.target.value)}
            placeholder="Recommended role"
            required
          />
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Recommended Level</label>
          <input
            type="text"
            className="promotion-form-input"
            value={formData.recommended_level || ''}
            onChange={(e) => handleChange('recommended_level', e.target.value)}
            placeholder="Recommended level"
          />
        </div>
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Priority</label>
        <select
          className="promotion-form-select"
          value={formData.priority || 'medium'}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Current Salary</label>
          <input
            type="number"
            className="promotion-form-input"
            value={formData.current_salary || ''}
            onChange={(e) => handleChange('current_salary', e.target.value)}
            placeholder="Current salary"
            min={0}
            step={1000}
          />
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Proposed Salary</label>
          <input
            type="number"
            className="promotion-form-input"
            value={formData.proposed_salary || ''}
            onChange={(e) => handleChange('proposed_salary', e.target.value)}
            placeholder="Proposed salary"
            min={0}
            step={1000}
          />
        </div>
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Target Promotion Date</label>
        <input
          type="date"
          className="promotion-form-input"
          value={formData.target_promotion_date || ''}
          onChange={(e) => handleChange('target_promotion_date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Justification *</label>
        <textarea
          className="promotion-form-textarea"
          value={formData.justification || ''}
          onChange={(e) => handleChange('justification', e.target.value)}
          placeholder="Explain why this promotion is recommended..."
          rows={4}
        />
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Supporting Evidence</label>
        <textarea
          className="promotion-form-textarea"
          value={formData.supporting_evidence || ''}
          onChange={(e) => handleChange('supporting_evidence', e.target.value)}
          placeholder="Provide supporting evidence..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default PromotionForm;