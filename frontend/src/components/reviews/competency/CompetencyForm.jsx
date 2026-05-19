// src/components/reviews/competency/CompetencyForm.jsx
import React, { useState } from 'react';
import './competency.css';
import { REVIEW_COMPETENCY_TYPES, REVIEW_COMPETENCY_TYPE_LABELS } from '@/config/constants';

const CompetencyForm = ({ 
    initialData = {}, 
    categories = [],
    ratingScales = [],
    onSubmit, 
    onCancel, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        competency_type: initialData.competency_type || REVIEW_COMPETENCY_TYPES.SOFT_SKILL,
        default_weight: initialData.default_weight !== undefined ? initialData.default_weight : 10,
        rating_scale_id: initialData.rating_scale_id || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_required: initialData.is_required || false,
        display_order: initialData.display_order || 0,
        excellent_behavior: initialData.excellent_behavior || '',
        needs_improvement_behavior: initialData.needs_improvement_behavior || '',
    });

    const [errors, setErrors] = useState({});

    const competencyTypeOptions = Object.entries(REVIEW_COMPETENCY_TYPES).map(([key, value]) => ({
        value,
        label: REVIEW_COMPETENCY_TYPE_LABELS[value],
    }));

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Competency name is required';
        }
        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }
        if (formData.default_weight < 0 || formData.default_weight > 100) {
            newErrors.default_weight = 'Weight must be between 0 and 100';
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
                <label className="form-label required">Competency Name</label>
                <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Strategic Thinking"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Description</label>
                <textarea
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="3"
                    placeholder="Detailed description of what this competency means"
                />
                {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                        className="form-select"
                        value={formData.category_id}
                        onChange={(e) => handleChange('category_id', e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Competency Type</label>
                    <select
                        className="form-select"
                        value={formData.competency_type}
                        onChange={(e) => handleChange('competency_type', e.target.value)}
                    >
                        {competencyTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Default Weight (%)</label>
                    <input
                        type="number"
                        className={`form-input ${errors.default_weight ? 'error' : ''}`}
                        value={formData.default_weight}
                        onChange={(e) => handleChange('default_weight', parseFloat(e.target.value))}
                        min="0"
                        max="100"
                        step="1"
                    />
                    <div className="form-hint">Percentage weight for this competency (0-100)</div>
                    {errors.default_weight && <div className="form-error">{errors.default_weight}</div>}
                </div>
                <div className="form-group">
                    <label className="form-label">Rating Scale</label>
                    <select
                        className="form-select"
                        value={formData.rating_scale_id}
                        onChange={(e) => handleChange('rating_scale_id', e.target.value)}
                    >
                        <option value="">Use Cycle Default</option>
                        {ratingScales.map(scale => (
                            <option key={scale.id} value={scale.id}>{scale.name}</option>
                        ))}
                    </select>
                    <div className="form-hint">Optional custom rating scale for this competency</div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.display_order}
                        onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                        placeholder="Lower numbers appear first"
                    />
                </div>
            </div>

            <div className="form-row">
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
                <div className="form-group">
                    <label className="form-label">
                        <input
                            type="checkbox"
                            checked={formData.is_required}
                            onChange={(e) => handleChange('is_required', e.target.checked)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Required (must be included in all review cycles)
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Excellent Behavior Indicators</label>
                <textarea
                    className="form-textarea"
                    value={formData.excellent_behavior}
                    onChange={(e) => handleChange('excellent_behavior', e.target.value)}
                    rows="2"
                    placeholder="What does exceptional performance look like for this competency?"
                />
                <div className="form-hint">Examples of behavior that demonstrates excellence</div>
            </div>

            <div className="form-group">
                <label className="form-label">Needs Improvement Behavior Indicators</label>
                <textarea
                    className="form-textarea"
                    value={formData.needs_improvement_behavior}
                    onChange={(e) => handleChange('needs_improvement_behavior', e.target.value)}
                    rows="2"
                    placeholder="What does poor performance look like for this competency?"
                />
                <div className="form-hint">Examples of behavior that needs improvement</div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (initialData.id ? 'Update Competency' : 'Create Competency')}
                </button>
            </div>
        </form>
    );
};

export default CompetencyForm;