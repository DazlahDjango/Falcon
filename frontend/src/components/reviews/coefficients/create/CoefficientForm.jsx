// src/components/reviews/coefficients/create/CoefficientForm.jsx
import React, { useState, useEffect } from 'react';
import { useEmployees } from '../../../../hooks/accounts';
import { useDivisions, useDepartments, useSections, useUnits, usePositions } from '../../../../hooks/structure';

const CoefficientForm = ({ data, onChange }) => {
  const selectedType = data?.coefficient_type || 'department';
  
  const { data: usersData } = useEmployees();
  const { items: divisionsItems, fetchAll: fetchDivisions } = useDivisions({ autoFetch: false });
  const { items: departmentsItems, fetchAll: fetchDepartments } = useDepartments({ autoFetch: false });
  const { items: sectionsItems, fetchAll: fetchSections } = useSections({ autoFetch: false });
  const { items: unitsItems, fetchAll: fetchUnits } = useUnits({ autoFetch: false });
  const { items: positionsItems, fetchAll: fetchPositions } = usePositions({ autoFetch: false });

  const divisions = Array.isArray(divisionsItems) ? divisionsItems : (divisionsItems?.results || []);
  const departments = Array.isArray(departmentsItems) ? departmentsItems : (departmentsItems?.results || []);
  const sections = Array.isArray(sectionsItems) ? sectionsItems : (sectionsItems?.results || []);
  const units = Array.isArray(unitsItems) ? unitsItems : (unitsItems?.results || []);
  const positions = Array.isArray(positionsItems) ? positionsItems : (positionsItems?.results || []);
  const users = Array.isArray(usersData) ? usersData : (usersData?.results || []);

  const [formData, setFormData] = useState(data);

  useEffect(() => {
    if (selectedType === 'division' && !divisions.length && fetchDivisions) {
      fetchDivisions({ page: 1, pageSize: 200 });
    } else if (selectedType === 'department' && !departments.length && fetchDepartments) {
      fetchDepartments({ page: 1, pageSize: 200 });
    } else if (selectedType === 'section' && !sections.length && fetchSections) {
      fetchSections({ page: 1, pageSize: 200 });
    } else if (selectedType === 'unit' && !units.length && fetchUnits) {
      fetchUnits({ page: 1, pageSize: 200 });
    } else if (selectedType === 'position' && !positions.length && fetchPositions) {
      fetchPositions({ page: 1, pageSize: 200 });
    }
  }, [selectedType, fetchDivisions, fetchDepartments, fetchSections, fetchUnits, fetchPositions]);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const coefficientTypes = [
    { value: 'division', label: 'Division Level' },
    { value: 'department', label: 'Department Level' },
    { value: 'section', label: 'Section Level' },
    { value: 'unit', label: 'Unit Level' },
    { value: 'position', label: 'Position Level' },
    { value: 'individual', label: 'Individual Level' },
  ];

  const showDivision = formData.coefficient_type === 'division';
  const showDepartment = formData.coefficient_type === 'department';
  const showSection = formData.coefficient_type === 'section';
  const showUnit = formData.coefficient_type === 'unit';
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

      {showDivision && (
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Division</label>
          <select
            className="coefficient-form-select"
            value={formData.division || ''}
            onChange={(e) => handleChange('division', e.target.value)}
          >
            <option value="">Select division...</option>
            {divisions?.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </select>
        </div>
      )}

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

      {showSection && (
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Section</label>
          <select
            className="coefficient-form-select"
            value={formData.section || ''}
            onChange={(e) => handleChange('section', e.target.value)}
          >
            <option value="">Select section...</option>
            {sections?.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showUnit && (
        <div className="coefficient-form-group">
          <label className="coefficient-form-label">Unit</label>
          <select
            className="coefficient-form-select"
            value={formData.unit || ''}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            <option value="">Select unit...</option>
            {units?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
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
          >
            <option value="">Select user...</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
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