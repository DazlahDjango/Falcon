import React, { useState } from 'react';

const KPICreateStep2 = ({ data, onNext, onBack, onCancel }) => {
    const [formData, setFormData] = useState({
        target_min: data.target_min || '',
        target_max: data.target_max || '',
        decimal_places: data.decimal_places || 2,
        strategic_objective: data.strategic_objective || '',
        is_active: data.is_active !== undefined ? data.is_active : true
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
        
        if (formData.target_min && formData.target_max && 
            parseFloat(formData.target_min) > parseFloat(formData.target_max)) {
            newErrors.target_min = 'Minimum cannot be greater than maximum';
            newErrors.target_max = 'Maximum cannot be less than minimum';
        }
        
        if (data.kpi_type === 'PERCENTAGE') {
            if (formData.target_min && parseFloat(formData.target_min) > 100) {
                newErrors.target_min = 'Percentage minimum cannot exceed 100%';
            }
            if (formData.target_max && parseFloat(formData.target_max) > 100) {
                newErrors.target_max = 'Percentage maximum cannot exceed 100%';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = () => {
        if (validate()) {
            onNext(formData);
        }
    };
    
    return (
        <div className="kpi-create-step">
            <div className="step-header">
                <h3>Target & Configuration</h3>
                <p>Set performance targets and display preferences</p>
            </div>
            
            <div className="step-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Minimum Target</label>
                        <input
                            type="number"
                            value={formData.target_min}
                            onChange={(e) => handleChange('target_min', e.target.value ? parseFloat(e.target.value) : '')}
                            placeholder="Min value"
                            step="any"
                            className={errors.target_min ? 'error' : ''}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Maximum Target</label>
                        <input
                            type="number"
                            value={formData.target_max}
                            onChange={(e) => handleChange('target_max', e.target.value ? parseFloat(e.target.value) : '')}
                            placeholder="Max value"
                            step="any"
                            className={errors.target_max ? 'error' : ''}
                        />
                    </div>
                </div>
                {(errors.target_min || errors.target_max) && (
                    <div className="error-message">{errors.target_min || errors.target_max}</div>
                )}
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Decimal Places</label>
                        <select
                            value={formData.decimal_places}
                            onChange={(e) => handleChange('decimal_places', parseInt(e.target.value))}
                        >
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                        <small>Number of decimal places for display</small>
                    </div>
                    
                    <div className="form-group">
                        <label>Strategic Objective</label>
                        <input
                            type="text"
                            value={formData.strategic_objective}
                            onChange={(e) => handleChange('strategic_objective', e.target.value)}
                            placeholder="e.g., Increase market share by 15%"
                        />
                        <small>Link this KPI to a strategic goal</small>
                    </div>
                </div>
                
                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                        />
                        Activate immediately after creation
                    </label>
                    <small>Inactive KPIs won't appear in dashboards or calculations</small>
                </div>
                
                {data.kpi_type === 'PERCENTAGE' && (
                    <div className="info-box">
                        <strong>ℹ️ Percentage KPI</strong>
                        <p>Target values will be displayed as percentages. Values will be automatically normalized to 0-100 range.</p>
                    </div>
                )}
            </div>
            
            <div className="step-actions">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="back-btn" onClick={onBack}>← Back</button>
                <button className="next-btn" onClick={handleSubmit}>Next Step →</button>
            </div>
        </div>
    );
};

export default KPICreateStep2;