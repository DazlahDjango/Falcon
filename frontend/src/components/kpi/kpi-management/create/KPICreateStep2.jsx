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
        return true;
    };
    
    const handleSubmit = () => {
        if (validate()) {
            onNext(formData);
        }
    };
    
    return (
        <div className="kpi-create-step">
            <div className="step-header">
                <h3>Configuration & Objective</h3>
                <p>Set display preferences and strategic objectives for this KPI</p>
            </div>
            
            <div className="step-form">
                
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