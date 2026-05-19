// src/components/reviews/ratingScale/RatingScaleForm.jsx
import React, { useState } from 'react';
import './ratingScale.css';

const RatingScaleForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        levels: initialData.levels || [
            { value: 5, label: 'Outstanding', color: '#10b981', min_pct: 90 },
            { value: 4, label: 'Exceeds Expectations', color: '#34d399', min_pct: 75 },
            { value: 3, label: 'Meets Expectations', color: '#fbbf24', min_pct: 60 },
            { value: 2, label: 'Needs Improvement', color: '#f97316', min_pct: 40 },
            { value: 1, label: 'Unsatisfactory', color: '#ef4444', min_pct: 0 },
        ],
        min_value: initialData.min_value !== undefined ? initialData.min_value : 1,
        max_value: initialData.max_value !== undefined ? initialData.max_value : 5,
        allow_decimal: initialData.allow_decimal || false,
        reverse_scoring: initialData.reverse_scoring || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleLevelChange = (index, field, value) => {
        const newLevels = [...formData.levels];
        newLevels[index][field] = value;
        setFormData(prev => ({ ...prev, levels: newLevels }));
    };

    const addLevel = () => {
        const newValue = formData.levels.length + 1;
        setFormData(prev => ({
            ...prev,
            levels: [
                ...prev.levels,
                { 
                    value: newValue, 
                    label: `Level ${newValue}`, 
                    color: '#6b7280', 
                    min_pct: 0 
                }
            ]
        }));
    };

    const removeLevel = (index) => {
        if (formData.levels.length <= 2) {
            setErrors({ levels: 'At least 2 rating levels are required' });
            return;
        }
        const newLevels = formData.levels.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, levels: newLevels }));
        setErrors({});
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Rating scale name is required';
        }
        if (!formData.levels || formData.levels.length < 2) {
            newErrors.levels = 'At least 2 rating levels are required';
        }
        
        // Validate levels
        const values = formData.levels.map(l => l.value);
        const hasDuplicate = values.some((v, i) => values.indexOf(v) !== i);
        if (hasDuplicate) {
            newErrors.levels = 'Duplicate level values found';
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
        <form className="ratingscale-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Scale Name</label>
                <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., 5-Tier Corporate Scale"
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
                    placeholder="Optional description of when to use this scale"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Min Value</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.min_value}
                        onChange={(e) => handleChange('min_value', parseFloat(e.target.value))}
                        step="0.5"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Max Value</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.max_value}
                        onChange={(e) => handleChange('max_value', parseFloat(e.target.value))}
                        step="0.5"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Rating Levels</label>
                <div className="levels-editor">
                    {formData.levels.map((level, index) => (
                        <div key={index} className="level-editor-row">
                            <input
                                type="number"
                                className="level-editor-input"
                                value={level.value}
                                onChange={(e) => handleLevelChange(index, 'value', parseFloat(e.target.value))}
                                placeholder="Value"
                                step="0.5"
                            />
                            <input
                                type="text"
                                className="level-editor-input level-editor-input-label"
                                value={level.label}
                                onChange={(e) => handleLevelChange(index, 'label', e.target.value)}
                                placeholder="Label"
                            />
                            <input
                                type="color"
                                className="level-editor-input-color"
                                value={level.color}
                                onChange={(e) => handleLevelChange(index, 'color', e.target.value)}
                            />
                            <input
                                type="number"
                                className="level-editor-input"
                                value={level.min_pct}
                                onChange={(e) => handleLevelChange(index, 'min_pct', parseInt(e.target.value))}
                                placeholder="Min %"
                                min="0"
                                max="100"
                            />
                            <button
                                type="button"
                                className="remove-level-btn"
                                onClick={() => removeLevel(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="add-level-btn" onClick={addLevel}>
                    + Add Level
                </button>
                {errors.levels && <div className="form-error">{errors.levels}</div>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">
                        <input
                            type="checkbox"
                            checked={formData.allow_decimal}
                            onChange={(e) => handleChange('allow_decimal', e.target.checked)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Allow Decimal Values (e.g., 3.7)
                    </label>
                </div>
                <div className="form-group">
                    <label className="form-label">
                        <input
                            type="checkbox"
                            checked={formData.reverse_scoring}
                            onChange={(e) => handleChange('reverse_scoring', e.target.checked)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Reverse Scoring (higher score = worse)
                    </label>
                </div>
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
                    {isLoading ? 'Saving...' : (initialData.id ? 'Update Scale' : 'Create Scale')}
                </button>
            </div>
        </form>
    );
};

export default RatingScaleForm;