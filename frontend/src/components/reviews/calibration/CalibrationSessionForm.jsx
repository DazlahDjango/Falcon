// src/components/reviews/calibration/CalibrationSessionForm.jsx
import React, { useState } from 'react';
import './calibration.css';

const CalibrationSessionForm = ({ 
    cycles = [],
    managers = [],
    initialData = {}, 
    onSubmit, 
    onCancel, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        review_cycle_id: initialData.review_cycle_id || '',
        session_type: initialData.session_type || 'final',
        scheduled_date: initialData.scheduled_date || '',
        facilitator_id: initialData.facilitator_id || '',
        participant_ids: initialData.participant_ids || [],
        department_ids: initialData.department_ids || [],
        agenda: initialData.agenda || '',
    });

    const [errors, setErrors] = useState({});

    const sessionTypeOptions = [
        { value: 'initial', label: 'Initial Calibration' },
        { value: 'mid_cycle', label: 'Mid-Cycle Review' },
        { value: 'final', label: 'Final Calibration' },
        { value: 'adhoc', label: 'Ad-Hoc Session' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleParticipantChange = (managerId) => {
        setFormData(prev => ({
            ...prev,
            participant_ids: prev.participant_ids.includes(managerId)
                ? prev.participant_ids.filter(id => id !== managerId)
                : [...prev.participant_ids, managerId]
        }));
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Session name is required';
        }
        if (!formData.review_cycle_id) {
            newErrors.review_cycle_id = 'Review cycle is required';
        }
        if (!formData.scheduled_date) {
            newErrors.scheduled_date = 'Scheduled date is required';
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
        <form className="calibration-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label required">Session Name</label>
                <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Q4 2024 Calibration Session"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="2"
                    placeholder="Optional description of the session"
                />
            </div>

            <div className="form-row">
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
                    <label className="form-label required">Session Type</label>
                    <select
                        className="form-select"
                        value={formData.session_type}
                        onChange={(e) => handleChange('session_type', e.target.value)}
                    >
                        {sessionTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">Scheduled Date & Time</label>
                    <input
                        type="datetime-local"
                        className={`form-input ${errors.scheduled_date ? 'error' : ''}`}
                        value={formData.scheduled_date}
                        onChange={(e) => handleChange('scheduled_date', e.target.value)}
                    />
                    {errors.scheduled_date && <div className="form-error">{errors.scheduled_date}</div>}
                </div>
                <div className="form-group">
                    <label className="form-label">Facilitator (HR/Admin)</label>
                    <select
                        className="form-select"
                        value={formData.facilitator_id}
                        onChange={(e) => handleChange('facilitator_id', e.target.value)}
                    >
                        <option value="">Select Facilitator</option>
                        {managers.filter(m => m.role === 'hr' || m.role === 'admin').map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Participants (Managers)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    {managers.filter(m => m.role === 'manager' || m.role === 'executive').map(manager => (
                        <label key={manager.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.participant_ids.includes(manager.id)}
                                onChange={() => handleParticipantChange(manager.id)}
                            />
                            {manager.name}
                        </label>
                    ))}
                </div>
                <div className="form-hint">Select managers who will participate in this calibration session</div>
            </div>

            <div className="form-group">
                <label className="form-label">Agenda</label>
                <textarea
                    className="form-textarea"
                    value={formData.agenda}
                    onChange={(e) => handleChange('agenda', e.target.value)}
                    rows="4"
                    placeholder="Session agenda items (one per line)"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Creating...' : (initialData.id ? 'Update Session' : 'Create Session')}
                </button>
            </div>
        </form>
    );
};

export default CalibrationSessionForm;