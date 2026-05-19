// src/components/reviews/feedback/FeedbackRequestForm.jsx
import React, { useState } from 'react';
import './feedback.css';

const FeedbackRequestForm = ({ 
    employees = [], 
    cycles = [],
    initialData = {}, 
    onSubmit, 
    onCancel, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState({
        subject_id: initialData.subject_id || '',
        reviewer_id: initialData.reviewer_id || '',
        review_cycle_id: initialData.review_cycle_id || '',
        reviewer_type: initialData.reviewer_type || 'peer',
        is_anonymous: initialData.is_anonymous !== undefined ? initialData.is_anonymous : true,
        is_required: initialData.is_required !== undefined ? initialData.is_required : false,
        due_date: initialData.due_date || '',
    });

    const [errors, setErrors] = useState({});

    const reviewerTypeOptions = [
        { value: 'manager', label: 'Manager' },
        { value: 'peer', label: 'Peer (Same Level)' },
        { value: 'subordinate', label: 'Subordinate' },
        { value: 'cross_dept', label: 'Cross-Department' },
        { value: 'external', label: 'External (Client/Partner)' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.subject_id) {
            newErrors.subject_id = 'Subject (employee) is required';
        }
        if (!formData.reviewer_id) {
            newErrors.reviewer_id = 'Reviewer is required';
        }
        if (!formData.review_cycle_id) {
            newErrors.review_cycle_id = 'Review cycle is required';
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
        <form className="feedback-request-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Employee (Subject)</label>
                <select
                    className={`form-select ${errors.subject_id ? 'error' : ''}`}
                    value={formData.subject_id}
                    onChange={(e) => handleChange('subject_id', e.target.value)}
                >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                </select>
                {errors.subject_id && <div className="form-error">{errors.subject_id}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Reviewer</label>
                <select
                    className={`form-select ${errors.reviewer_id ? 'error' : ''}`}
                    value={formData.reviewer_id}
                    onChange={(e) => handleChange('reviewer_id', e.target.value)}
                >
                    <option value="">Select Reviewer</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                </select>
                {errors.reviewer_id && <div className="form-error">{errors.reviewer_id}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Review Cycle</label>
                <select
                    className={`form-select ${errors.review_cycle_id ? 'error' : ''}`}
                    value={formData.review_cycle_id}
                    onChange={(e) => handleChange('review_cycle_id', e.target.value)}
                >
                    <option value="">Select Review Cycle</option>
                    {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                    ))}
                </select>
                {errors.review_cycle_id && <div className="form-error">{errors.review_cycle_id}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Reviewer Type</label>
                <select
                    className="form-select"
                    value={formData.reviewer_type}
                    onChange={(e) => handleChange('reviewer_type', e.target.value)}
                >
                    {reviewerTypeOptions.map(opt => (
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

            <div className="form-group">
                <label className="form-label">
                    <input
                        type="checkbox"
                        checked={formData.is_anonymous}
                        onChange={(e) => handleChange('is_anonymous', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                    />
                    Anonymous (reviewer's identity hidden from subject)
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
                    Required (must be completed for cycle to close)
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Request'}
                </button>
            </div>
        </form>
    );
};

export default FeedbackRequestForm;