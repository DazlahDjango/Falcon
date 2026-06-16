// src/components/reviews/competency-categories/create/CategoryForm.jsx
import React from 'react';

const CategoryForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="category-form">
      <div className="category-form-group">
        <label className="category-form-label">Name *</label>
        <input
          type="text"
          className="category-form-input"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter category name"
          required
        />
      </div>

      <div className="category-form-group">
        <label className="category-form-label">Description</label>
        <textarea
          className="category-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="category-form-row">
        <div className="category-form-group">
          <label className="category-form-label">Order</label>
          <input
            type="number"
            className="category-form-input"
            value={data.order || 0}
            onChange={(e) => handleChange('order', Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="category-form-group">
          <label className="category-form-label">Parent Category</label>
          <select
            className="category-form-select"
            value={data.parent_id || ''}
            onChange={(e) => handleChange('parent_id', e.target.value || null)}
          >
            <option value="">None (Root Category)</option>
            {/* Parent categories would be populated from props */}
          </select>
        </div>
      </div>

      <div className="category-form-checkbox-group">
        <label className="category-form-checkbox">
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

export default CategoryForm;