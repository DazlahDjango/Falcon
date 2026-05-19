// src/components/reviews/competency/CompetencyCategoryForm.jsx
import React, { useState } from 'react';
import './competency.css';

const CompetencyCategoryForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        order: initialData.order || 0,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Category name is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form className="competency-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Category Name</label>
                <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Leadership Skills"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="3"
                    placeholder="Optional description of this category"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                    type="number"
                    className="form-input"
                    value={formData.order}
                    onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                    placeholder="Lower numbers appear first"
                />
                <div className="form-hint">Categories with lower order numbers appear first</div>
            </div>

            <div className="form-group">
                <label className="form-label">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                    />
                    Active (available for use in reviews)
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (initialData.id ? 'Update Category' : 'Create Category')}
                </button>
            </div>
        </form>
    );
};

export default CompetencyCategoryForm;