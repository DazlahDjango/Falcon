// src/components/reviews/cycle/CycleForm.jsx
import React, { useState } from 'react';
import './cycle.css';
import { REVIEW_CYCLE_TYPES, REVIEW_CYCLE_TYPE_LABELS } from '@/config/constants';

const CycleForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        cycle_type: initialData.cycle_type || REVIEW_CYCLE_TYPES.END_YEAR,
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        self_assessment_deadline: initialData.self_assessment_deadline || '',
        supervisor_review_deadline: initialData.supervisor_review_deadline || '',
        final_approval_deadline: initialData.final_approval_deadline || '',
        kpi_weight: initialData.kpi_weight !== undefined ? initialData.kpi_weight : 70,
        competency_weight: initialData.competency_weight !== undefined ? initialData.competency_weight : 30,
        mission_weight: initialData.mission_weight || 0,
        task_weight: initialData.task_weight || 0,
        rating_scale: initialData.rating_scale || '',
        ...initialData,
    });

    const [errors, setErrors] = useState({});

    const cycleTypes = Object.entries(REVIEW_CYCLE_TYPES).map(([key, value]) => ({
        value,
        label: REVIEW_CYCLE_TYPE_LABELS[value],
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
            newErrors.name = 'Cycle name is required';
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
        
        const totalWeight = (formData.kpi_weight || 0) + 
                           (formData.competency_weight || 0) + 
                           (formData.mission_weight || 0) + 
                           (formData.task_weight || 0);
        if (Math.abs(totalWeight - 100) > 5) {
            newErrors.weights = `Total weights sum to ${totalWeight}%. Must be 100%`;
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
        <form className="cycle-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Cycle Name</label>
                <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., 2024 End-Year Review"
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
                    placeholder="Optional description of this review cycle"
                />
            </div>

            <div className="form-group">
                <label className="form-label required">Cycle Type</label>
                <select
                    className="form-select"
                    value={formData.cycle_type}
                    onChange={(e) => handleChange('cycle_type', e.target.value)}
                >
                    {cycleTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-row">
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

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Self Assessment Deadline</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.self_assessment_deadline}
                        onChange={(e) => handleChange('self_assessment_deadline', e.target.value)}
                    />
                    <div className="form-hint">Deadline for employees to submit self assessment</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Supervisor Review Deadline</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.supervisor_review_deadline}
                        onChange={(e) => handleChange('supervisor_review_deadline', e.target.value)}
                    />
                    <div className="form-hint">Deadline for managers to complete reviews</div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Final Approval Deadline</label>
                <input
                    type="date"
                    className="form-input"
                    value={formData.final_approval_deadline}
                    onChange={(e) => handleChange('final_approval_deadline', e.target.value)}
                />
                <div className="form-hint">Deadline for HR/Admin final approval</div>
            </div>

            <div className="form-group">
                <label className="form-label">Weights Configuration</label>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">KPI Weight (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.kpi_weight}
                            onChange={(e) => handleChange('kpi_weight', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Competency Weight (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.competency_weight}
                            onChange={(e) => handleChange('competency_weight', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Mission Weight (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.mission_weight}
                            onChange={(e) => handleChange('mission_weight', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                        />
                        <div className="form-hint">Mission report quality score weight</div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Task Weight (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.task_weight}
                            onChange={(e) => handleChange('task_weight', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                        />
                        <div className="form-hint">Task completion rate weight</div>
                    </div>
                </div>
                {errors.weights && <div className="form-error">{errors.weights}</div>}
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (initialData.id ? 'Update Cycle' : 'Create Cycle')}
                </button>
            </div>
        </form>
    );
};

export default CycleForm;