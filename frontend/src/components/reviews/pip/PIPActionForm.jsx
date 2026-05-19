// src/components/reviews/pip/PIPActionForm.jsx
import React, { useState } from 'react';
import './pip.css';

const PIPActionForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        due_date: initialData.due_date || '',
        requires_evidence: initialData.requires_evidence || false,
    });

    const [errors, setErrors] = useState({});

    const priorityOptions = [
        { value: 'high', label: 'High - Must Complete' },
        { value: 'medium', label: 'Medium - Important' },
        { value: 'low', label: 'Low - Nice to Have' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.title?.trim()) {
            newErrors.title = 'Action title is required';
        }
        if (!formData.due_date) {
            newErrors.due_date = 'Due date is required';
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
        <form onSubmit={handleSubmit}>
            <h4 style={{ marginBottom: '1rem' }}>Add New Action</h4>
            
            <div className="form-group">
                <label className="form-label required">Title</label>
                <input
                    type="text"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Complete Sales Training"
                />
                {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="2"
                    placeholder="Detailed description of what needs to be done"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                    >
                        {priorityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label required">Due Date</label>
                    <input
                        type="date"
                        className={`form-input ${errors.due_date ? 'error' : ''}`}
                        value={formData.due_date}
                        onChange={(e) => handleChange('due_date', e.target.value)}
                    />
                    {errors.due_date && <div className="form-error">{errors.due_date}</div>}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">
                    <input
                        type="checkbox"
                        checked={formData.requires_evidence}
                        onChange={(e) => handleChange('requires_evidence', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                    />
                    Requires Evidence (certificate, report, etc.)
                </label>
            </div>

            <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Action'}
                </button>
            </div>
        </form>
    );
};

export default PIPActionForm;