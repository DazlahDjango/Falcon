import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const KPIEditConfig = ({ kpi, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        target_min: kpi?.target_min || '',
        target_max: kpi?.target_max || '',
        decimal_places: kpi?.decimal_places || 2,
        strategic_objective: kpi?.strategic_objective || '',
        is_active: kpi?.is_active ?? true
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    
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
            newErrors.target_min = 'Min cannot be greater than max';
        }
        if (kpi?.kpi_type === 'PERCENTAGE') {
            if (formData.target_min && parseFloat(formData.target_min) > 100) {
                newErrors.target_min = 'Max 100%';
            }
            if (formData.target_max && parseFloat(formData.target_max) > 100) {
                newErrors.target_max = 'Max 100%';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async () => {
        if (!validate()) return;
        setErrors({});
        setSubmitError(null);
        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Failed to save KPI:', error);
            setSubmitError(error?.message || 'Failed to save KPI. Please try again.');
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="kpi-edit-form">
            {submitError && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{submitError}</span>
                        <button 
                            className="close-btn" 
                            onClick={() => setSubmitError(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>
            )}
            <div className="form-row">
                <div className="form-group">
                    <label>Minimum Target</label>
                    <input 
                        type="number"
                        value={formData.target_min}
                        onChange={(e) => handleChange('target_min', e.target.value ? parseFloat(e.target.value) : '')}
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
                </div>
            </div>
            
            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input 
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                    />
                    Active
                </label>
            </div>
            
            <div className="form-actions">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSubmit} disabled={saving}>
                    <FiSave size={14} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default KPIEditConfig;