// src/components/reviews/pip/PIPForm.jsx
import React, { useState } from 'react';
import './pip.css';
import { REVIEW_PIP_SEVERITY, REVIEW_PIP_SEVERITY_LABELS } from '@/config/constants';

const PIPForm = ({ initialData = {}, employees = [], onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        employee_id: initialData.employee_id || '',
        severity: initialData.severity || 'moderate',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        improvement_areas: initialData.improvement_areas || '',
        success_criteria: initialData.success_criteria || '',
        consequences_if_failed: initialData.consequences_if_failed || '',
        consequences_if_successful: initialData.consequences_if_successful || '',
    });

    const [errors, setErrors] = useState({});

    const severityOptions = [
        { value: REVIEW_PIP_SEVERITY.MINOR, label: REVIEW_PIP_SEVERITY_LABELS[REVIEW_PIP_SEVERITY.MINOR] },
        { value: REVIEW_PIP_SEVERITY.MODERATE, label: REVIEW_PIP_SEVERITY_LABELS[REVIEW_PIP_SEVERITY.MODERATE] },
        { value: REVIEW_PIP_SEVERITY.SEVERE, label: REVIEW_PIP_SEVERITY_LABELS[REVIEW_PIP_SEVERITY.SEVERE] },
        { value: REVIEW_PIP_SEVERITY.CRITICAL, label: REVIEW_PIP_SEVERITY_LABELS[REVIEW_PIP_SEVERITY.CRITICAL] },
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
            newErrors.title = 'PIP title is required';
        }
        if (!formData.employee_id) {
            newErrors.employee_id = 'Employee is required';
        }
        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }
        if (!formData.end_date) {
            newErrors.end_date = 'End date is required';
        }
        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            newErrors.end_date = 'End date must be after start date';
        }
        if (!formData.improvement_areas?.trim()) {
            newErrors.improvement_areas = 'Improvement areas are required';
        }
        if (!formData.success_criteria?.trim()) {
            newErrors.success_criteria = 'Success criteria are required';
        }
        if (!formData.consequences_if_failed?.trim()) {
            newErrors.consequences_if_failed = 'Consequences for failure are required';
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
        <form className="pip-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">PIP Title</label>
                <input
                    type="text"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Sales Performance Improvement Plan"
                />
                {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Employee</label>
                <select
                    className={`form-select ${errors.employee_id ? 'error' : ''}`}
                    value={formData.employee_id}
                    onChange={(e) => handleChange('employee_id', e.target.value)}
                >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                </select>
                {errors.employee_id && <div className="form-error">{errors.employee_id}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="3"
                    placeholder="Detailed description of performance issues and expectations"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">Severity</label>
                    <select
                        className="form-select"
                        value={formData.severity}
                        onChange={(e) => handleChange('severity', e.target.value)}
                    >
                        {severityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input
                        type="date"
                        className={`form-input ${errors.start_date ? 'error' : ''}`}
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                    />
                    {errors.start_date && <div className="form-error">{errors.start_date}</div>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">End Date</label>
                    <input
                        type="date"
                        className={`form-input ${errors.end_date ? 'error' : ''}`}
                        value={formData.end_date}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                    {errors.end_date && <div className="form-error">{errors.end_date}</div>}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label required">Improvement Areas</label>
                <textarea
                    className={`form-textarea ${errors.improvement_areas ? 'error' : ''}`}
                    value={formData.improvement_areas}
                    onChange={(e) => handleChange('improvement_areas', e.target.value)}
                    rows="3"
                    placeholder="Specific areas requiring improvement"
                />
                {errors.improvement_areas && <div className="form-error">{errors.improvement_areas}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Success Criteria</label>
                <textarea
                    className={`form-textarea ${errors.success_criteria ? 'error' : ''}`}
                    value={formData.success_criteria}
                    onChange={(e) => handleChange('success_criteria', e.target.value)}
                    rows="3"
                    placeholder="Measurable criteria that define success"
                />
                {errors.success_criteria && <div className="form-error">{errors.success_criteria}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Consequences if Failed</label>
                <textarea
                    className={`form-textarea ${errors.consequences_if_failed ? 'error' : ''}`}
                    value={formData.consequences_if_failed}
                    onChange={(e) => handleChange('consequences_if_failed', e.target.value)}
                    rows="2"
                    placeholder="What happens if employee fails to improve"
                />
                {errors.consequences_if_failed && <div className="form-error">{errors.consequences_if_failed}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Consequences if Successful</label>
                <textarea
                    className="form-textarea"
                    value={formData.consequences_if_successful}
                    onChange={(e) => handleChange('consequences_if_successful', e.target.value)}
                    rows="2"
                    placeholder="What happens if employee successfully completes PIP"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (initialData.id ? 'Update PIP' : 'Create PIP')}
                </button>
            </div>
        </form>
    );
};

export default PIPForm;