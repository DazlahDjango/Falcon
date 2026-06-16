// src/components/reviews/rating-scales/create/RatingScaleForm.jsx
import React from 'react';

const RatingScaleForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="rating-scale-form">
      <h3 className="rating-scale-form-title">Basic Information</h3>
      <div className="rating-scale-form-group">
        <label className="rating-scale-form-label">Name *</label>
        <input
          type="text"
          className="rating-scale-form-input"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter rating scale name"
          required
        />
      </div>

      <div className="rating-scale-form-group">
        <label className="rating-scale-form-label">Description</label>
        <textarea
          className="rating-scale-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="rating-scale-form-row">
        <div className="rating-scale-form-group">
          <label className="rating-scale-form-label">Min Value</label>
          <input
            type="number"
            className="rating-scale-form-input"
            value={data.min_value}
            onChange={(e) => handleChange('min_value', Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="rating-scale-form-group">
          <label className="rating-scale-form-label">Max Value</label>
          <input
            type="number"
            className="rating-scale-form-input"
            value={data.max_value}
            onChange={(e) => handleChange('max_value', Number(e.target.value))}
            min={1}
          />
        </div>
      </div>

      <div className="rating-scale-form-checkbox-group">
        <label className="rating-scale-form-checkbox">
          <input
            type="checkbox"
            checked={data.allow_decimal || false}
            onChange={(e) => handleChange('allow_decimal', e.target.checked)}
          />
          Allow Decimal Values
        </label>
        <label className="rating-scale-form-checkbox">
          <input
            type="checkbox"
            checked={data.reverse_scoring || false}
            onChange={(e) => handleChange('reverse_scoring', e.target.checked)}
          />
          Reverse Scoring
        </label>
        <label className="rating-scale-form-checkbox">
          <input
            type="checkbox"
            checked={data.is_active || false}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          Active
        </label>
      </div>
    </div>
  );
};

export default RatingScaleForm;