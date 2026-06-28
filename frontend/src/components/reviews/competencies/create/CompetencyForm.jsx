// src/components/reviews/competencies/create/CompetencyForm.jsx
import React from 'react';
import { useCompetencyCategories } from '../../../../hooks/reviews';

const CompetencyForm = ({ data, onChange }) => {
  const { data: categories, loading } = useCompetencyCategories();

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const competencyTypes = [
    { value: 'leadership', label: 'Leadership' },
    { value: 'management', label: 'Management' },
    { value: 'technical', label: 'Technical Skills' },
    { value: 'soft_skill', label: 'Soft Skills' },
    { value: 'cultural', label: 'Cultural Fit' },
    { value: 'strategic', label: 'Strategic Thinking' },
    { value: 'operational', label: 'Operational Excellence' },
    { value: 'customer', label: 'Customer Focus' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'teamwork', label: 'Teamwork & Collaboration' },
  ];

  return (
    <div className="competency-form">
      <div className="competency-form-group">
        <label className="competency-form-label">Name *</label>
        <input
          type="text"
          className="competency-form-input"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter competency name"
          required
        />
      </div>

      <div className="competency-form-group">
        <label className="competency-form-label">Description</label>
        <textarea
          className="competency-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="competency-form-row">
        <div className="competency-form-group">
          <label className="competency-form-label">Type</label>
          <select
            className="competency-form-select"
            value={data.competency_type || 'technical'}
            onChange={(e) => handleChange('competency_type', e.target.value)}
          >
            {competencyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="competency-form-group">
          <label className="competency-form-label">Category</label>
          <select
            className="competency-form-select"
            value={data.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            disabled={loading}
          >
            <option value="">Select category...</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="competency-form-row">
        <div className="competency-form-group">
          <label className="competency-form-label">Default Weight (%)</label>
          <input
            type="number"
            className="competency-form-input"
            value={data.default_weight || 10}
            onChange={(e) => handleChange('default_weight', Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
        <div className="competency-form-group">
          <label className="competency-form-label">Display Order</label>
          <input
            type="number"
            className="competency-form-input"
            value={data.display_order || 0}
            onChange={(e) => handleChange('display_order', Number(e.target.value))}
            min={0}
          />
        </div>
      </div>

      <div className="competency-form-checkbox-group">
        <label className="competency-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_active || false}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          Active
        </label>
        <label className="competency-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_required || false}
            onChange={(e) => handleChange('is_required', e.target.checked)}
          />
          Required
        </label>
      </div>
    </div>
  );
};

export default CompetencyForm;