import React, { useState } from 'react';
import { FiTarget, FiUser, FiCalendar, FiSave } from 'react-icons/fi';

const TargetCreateForm = ({ kpis, users, onSubmit, onCancel }) => {
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState({
        kpi_id: '',
        user_id: '',
        year: currentYear,
        target_value: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.kpi_id) newErrors.kpi_id = 'Please select a KPI';
        if (!formData.user_id) newErrors.user_id = 'Please select a user';
        if (!formData.target_value) newErrors.target_value = 'Please enter target value';
        if (formData.target_value <= 0) newErrors.target_value = 'Target value must be positive';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        onSubmit(formData);
    };

    const selectedKpi = kpis?.find(k => k.id === formData.kpi_id);

    return (
        <div className="kpi-target-form">
            <div className="kpi-target-form-group">
                <label className="kpi-target-form-label">
                    <FiTarget size={14} />
                    Select Performance Indicator <span className="kpi-required">*</span>
                </label>
                <select 
                    className={`kpi-target-form-select ${errors.kpi_id ? 'error' : ''}`}
                    value={formData.kpi_id}
                    onChange={(e) => handleChange('kpi_id', e.target.value)}
                >
                    <option value="">Select a Performance Indicator...</option>
                    {kpis?.map(kpi => (
                        <option key={kpi.id} value={kpi.id}>
                            {kpi.name} ({kpi.unit || 'value'})
                        </option>
                    ))}
                </select>
                {errors.kpi_id && <span className="kpi-target-form-error">{errors.kpi_id}</span>}
            </div>
            
            <div className="kpi-target-form-group">
                <label className="kpi-target-form-label">
                    <FiUser size={14} />
                    Assign to User <span className="kpi-required">*</span>
                </label>
                <select 
                    className={`kpi-target-form-select ${errors.user_id ? 'error' : ''}`}
                    value={formData.user_id}
                    onChange={(e) => handleChange('user_id', e.target.value)}
                >
                    <option value="">Select a user...</option>
                    {users?.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                        </option>
                    ))}
                </select>
                {errors.user_id && <span className="kpi-target-form-error">{errors.user_id}</span>}
            </div>
            
            <div className="kpi-target-form-row">
                <div className="kpi-target-form-group">
                    <label className="kpi-target-form-label">
                        <FiCalendar size={14} />
                        Year <span className="kpi-required">*</span>
                    </label>
                    <select 
                        className="kpi-target-form-select"
                        value={formData.year}
                        onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    >
                        {[currentYear, currentYear + 1].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-target-form-group">
                    <label className="kpi-target-form-label">
                        Target Value <span className="kpi-required">*</span>
                    </label>
                    <input 
                        type="number"
                        className={`kpi-target-form-input ${errors.target_value ? 'error' : ''}`}
                        value={formData.target_value}
                        onChange={(e) => handleChange('target_value', parseFloat(e.target.value))}
                        placeholder={`Enter target in ${selectedKpi?.unit || 'units'}`}
                        step={selectedKpi?.decimal_places === 0 ? 1 : 0.01}
                    />
                    {errors.target_value && <span className="kpi-target-form-error">{errors.target_value}</span>}
                    {selectedKpi && (
                        <div className="kpi-target-form-hint">
                            Expected range: {selectedKpi.target_min} - {selectedKpi.target_max}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="kpi-target-form-group">
                <label className="kpi-target-form-label">Remarks (Optional)</label>
                <textarea 
                    className="kpi-target-form-textarea"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows="3"
                    placeholder="Add any additional remarks..."
                />
            </div>
            
            <div className="kpi-target-form-actions">
                <button className="kpi-target-form-cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button className="kpi-target-form-submit" onClick={handleSubmit}>
                    <FiSave size={14} />
                    Create Target
                </button>
            </div>
        </div>
    );
};

export default TargetCreateForm;