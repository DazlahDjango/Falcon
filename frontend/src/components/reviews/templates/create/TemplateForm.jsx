// src/components/reviews/templates/create/TemplateForm.jsx
import React from 'react';

const TemplateForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="template-form">
      <div className="template-form-group">
        <label className="template-form-label">Template Name *</label>
        <input
          type="text"
          className="template-form-input"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter template name"
          required
        />
      </div>

      <div className="template-form-group">
        <label className="template-form-label">Description</label>
        <textarea
          className="template-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="template-form-group">
        <label className="template-form-label">Applies To</label>
        <div className="template-form-checkbox-group">
          <label className="template-form-checkbox">
            <input
              type="checkbox"
              checked={data.applies_to_self_assessment || false}
              onChange={(e) => handleChange('applies_to_self_assessment', e.target.checked)}
            />
            Self Assessment
          </label>
          <label className="template-form-checkbox">
            <input
              type="checkbox"
              checked={data.applies_to_supervisor_review || false}
              onChange={(e) => handleChange('applies_to_supervisor_review', e.target.checked)}
            />
            Supervisor Review
          </label>
          <label className="template-form-checkbox">
            <input
              type="checkbox"
              checked={data.applies_to_360_feedback || false}
              onChange={(e) => handleChange('applies_to_360_feedback', e.target.checked)}
            />
            360 Feedback
          </label>
        </div>
      </div>

      <div className="template-form-row">
        <div className="template-form-group">
          <label className="template-form-label">Max Strength Chars</label>
          <input
            type="number"
            className="template-form-input"
            value={data.max_strength_chars || 500}
            onChange={(e) => handleChange('max_strength_chars', Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="template-form-group">
          <label className="template-form-label">Max Improvement Chars</label>
          <input
            type="number"
            className="template-form-input"
            value={data.max_improvement_chars || 500}
            onChange={(e) => handleChange('max_improvement_chars', Number(e.target.value))}
            min={0}
          />
        </div>
      </div>

      <div className="template-form-group">
        <label className="template-form-label">Max Goals Chars</label>
        <input
          type="number"
          className="template-form-input"
          value={data.max_goals_chars || 500}
          onChange={(e) => handleChange('max_goals_chars', Number(e.target.value))}
          min={0}
        />
      </div>

      <div className="template-form-checkbox-group">
        <label className="template-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_active || false}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          Active
        </label>
        <label className="template-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_default || false}
            onChange={(e) => handleChange('is_default', e.target.checked)}
          />
          Set as Default
        </label>
      </div>
    </div>
  );
};

export default TemplateForm;