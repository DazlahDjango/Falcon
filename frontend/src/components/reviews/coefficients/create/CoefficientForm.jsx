// src/components/reviews/coefficients/create/CoefficientForm.jsx
import React, { useState, useEffect } from 'react';
import { useEmployees } from '../../../../hooks/accounts';
import { useStructure } from '../../../../hooks/structure';

const CoefficientForm = ({ data, onChange }) => {
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { departments, positions } = useStructure();
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const coefficientTypes = [
    { value: 'individual', label: 'Individual Level' },
    { value: 'department', label: 'Department Level' },
    { value: 'position', label: 'Position Level' },
  ];

  const showDepartment = formData.coefficient_type === 'department';
  const showPosition = formData.coefficient_type === 'position';
  const showUser = formData.coefficient_type === 'individual';

  return (
    <div className="coefficient-form">
      <div className="coefficient-form-group">
        <label className="coefficient-form-label">Coefficient Type *</label>
        <select
          className="coefficient-form-select"
          value={formData.coefficient_type || 'department'}
          onChange={(e) => handleChange('coefficient_type', e.target.value)}
          required
        >
          {coefficientTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {showDepartment && (
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Department</label>
          <select
            className="coefficient-form-select"
            value={formData.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
          >
            <option value="">Select department...</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showPosition && (
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Position</label>
          <select
            className="coefficient-form-select"
            value={formData.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
          >
            <option value="">Select position...</option>
            {positions?.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {showUser && (
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">User</label>
          <select
            className="coefficient-form-select"
            value={formData.user || ''}
            onChange={(e) => handleChange('user', e.target.value)}
            disabled={employeesLoading}
          >
            <option value="">Select user...</option>
            {employees?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="coefficient-form-group">
        <label className="coefficient-form-label">Value *</label>
        <input
          type="number"
          className="coefficient-form-input"
          value={formData.value || 1.0}
          onChange={(e) => handleChange('value', Number(e.target.value))}
          min={0.5}
          max={1.5}
          step={0.01}
          required
        />
        <span className="coefficient-form-hint">Must be between 0.5 and 1.5</span>
      </div>

      <div className="coefficient-form-group">
        <label className="coefficient-form-label">Reason</label>
        <textarea
          className="coefficient-form-textarea"
          value={formData.reason || ''}
          onChange={(e) => handleChange('reason', e.target.value)}
          placeholder="Explain the reason for this coefficient..."
          rows={3}
        />
      </div>

      <div className="coefficient-form-row">
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Valid From *</label>
          <input
            type="date"
            className="coefficient-form-input"
            value={formData.valid_from || ''}
            onChange={(e) => handleChange('valid_from', e.target.value)}
            required
          />
        </div>
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Valid To</label>
          <input
            type="date"
            className="coefficient-form-input"
            value={formData.valid_to || ''}
            onChange={(e) => handleChange('valid_to', e.target.value)}
          />
        </div>
      </div>

      <div className="coefficient-form-checkbox-group">
        <label className="coefficient-form-checkbox">
          <input
            type="checkbox"
            checked={formData.is_active || false}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          Active
        </label>
      </div>
    </div>
  );
};

export default CoefficientForm;