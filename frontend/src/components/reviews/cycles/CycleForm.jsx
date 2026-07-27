// src/components/reviews/cycle/CycleForm.jsx
import React, { useState, useEffect } from 'react';
import './cycle.css';
import { REVIEW_CYCLE_TYPES, REVIEW_CYCLE_TYPE_LABELS } from '@/config/constants';
import { useRatingScales } from '@/hooks/reviews';

const CycleForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false, error }) => {
    const { ratingScales } = useRatingScales();
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

    const totalWeight = (formData.kpi_weight || 0) + 
                       (formData.competency_weight || 0) + 
                       (formData.mission_weight || 0) + 
                       (formData.task_weight || 0);

    // Auto-select standard default rating scale if available
    useEffect(() => {
        if (!formData.rating_scale && ratingScales.length > 0) {
            const defaultScale = ratingScales.find(s => s.is_default) || ratingScales[0];
            if (defaultScale) {
                setFormData(prev => ({ ...prev, rating_scale: defaultScale.id }));
            }
        }
    }, [ratingScales, formData.rating_scale]);

    const renderApiError = () => {
        if (!error) return null;
        if (typeof error === 'string') {
            return <div className="api-error-banner">{error}</div>;
        }
        if (typeof error === 'object') {
            return (
                <div className="api-error-banner">
                    <strong>Validation failed:</strong>
                    <ul>
                        {Object.entries(error).map(([field, messages]) => (
                            <li key={field}>
                                <strong>{field.replace('_', ' ')}:</strong> {Array.isArray(messages) ? messages.join(', ') : String(messages)}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        return null;
    };

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
        if (!formData.rating_scale) {
            newErrors.rating_scale = 'Rating scale is required';
        }
        
        if (Math.abs(totalWeight - 100) > 0.1) {
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
            {renderApiError()}
            
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

            <div className="form-row">
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

                <div className="form-group">
                    <label className="form-label required">Rating Scale</label>
                    <select
                        className={`form-select ${errors.rating_scale ? 'error' : ''}`}
                        value={formData.rating_scale}
                        onChange={(e) => handleChange('rating_scale', e.target.value)}
                    >
                        <option value="">Select Rating Scale</option>
                        {ratingScales.map(scale => (
                            <option key={scale.id} value={scale.id}>{scale.name}</option>
                        ))}
                    </select>
                    {errors.rating_scale && <div className="form-error">{errors.rating_scale}</div>}
                </div>
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

                {/* Segmented Weights Visualizer */}
                <div className="cycle-weights-visualizer">
                    <div className="cycle-weights-visualizer-bar">
                        <div 
                            className="cycle-weights-segment kpi" 
                            style={{ width: `${(formData.kpi_weight / (totalWeight || 1)) * 100}%` }}
                            title={`KPI: ${formData.kpi_weight}%`}
                        />
                        <div 
                            className="cycle-weights-segment competency" 
                            style={{ width: `${(formData.competency_weight / (totalWeight || 1)) * 100}%` }}
                            title={`Competency: ${formData.competency_weight}%`}
                        />
                        <div 
                            className="cycle-weights-segment mission" 
                            style={{ width: `${(formData.mission_weight / (totalWeight || 1)) * 100}%` }}
                            title={`Mission: ${formData.mission_weight}%`}
                        />
                        <div 
                            className="cycle-weights-segment task" 
                            style={{ width: `${(formData.task_weight / (totalWeight || 1)) * 100}%` }}
                            title={`Task: ${formData.task_weight}%`}
                        />
                    </div>
                    <div className="cycle-weights-legend">
                        <span className="cycle-weight-legend-item">
                            <span className="legend-dot kpi"></span>
                            KPI ({formData.kpi_weight || 0}%)
                        </span>
                        <span className="cycle-weight-legend-item">
                            <span className="legend-dot competency"></span>
                            Competency ({formData.competency_weight || 0}%)
                        </span>
                        <span className="cycle-weight-legend-item">
                            <span className="legend-dot mission"></span>
                            Mission ({formData.mission_weight || 0}%)
                        </span>
                        <span className="cycle-weight-legend-item">
                            <span className="legend-dot task"></span>
                            Task ({formData.task_weight || 0}%)
                        </span>
                    </div>
                    <div className="cycle-weights-summary">
                        <span className={`cycle-weights-total ${Math.abs(totalWeight - 100) < 0.1 ? 'valid' : 'invalid'}`}>
                            Total Weights: {totalWeight}% {Math.abs(totalWeight - 100) < 0.1 ? '✓ (Valid)' : '✗ (Must equal 100%)'}
                        </span>
                    </div>
                </div>
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