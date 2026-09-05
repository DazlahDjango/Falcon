import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const KPIEditBasic = ({ kpi, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: kpi?.name || '',
        code: kpi?.code || '',
        description: kpi?.description || '',
        kpi_type: kpi?.kpi_type || 'PERCENTAGE',
        calculation_logic: kpi?.calculation_logic || 'HIGHER_IS_BETTER',
        measure_type: kpi?.measure_type || 'CUMULATIVE',
        unit: kpi?.unit || ''
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    
    const kpiTypes = [
        { value: 'COUNT', label: 'Count / Number' },
        { value: 'PERCENTAGE', label: 'Percentage (%)' },
        { value: 'FINANCIAL', label: 'Financial Amount' },
        { value: 'MILESTONE', label: 'Yes / No Milestone' },
        { value: 'TIME', label: 'Time / Turnaround' },
        { value: 'IMPACT', label: 'Impact Score' }
    ];
    
    const calculationLogics = [
        { value: 'HIGHER_IS_BETTER', label: 'Higher is Better' },
        { value: 'LOWER_IS_BETTER', label: 'Lower is Better' }
    ];
    
    const measureTypes = [
        { value: 'CUMULATIVE', label: 'Cumulative (YTD)' },
        { value: 'NON_CUMULATIVE', label: 'Non-Cumulative' }
    ];
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Performance Indicator name is required';
        if (!formData.code.trim()) newErrors.code = 'Performance Indicator code is required';
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
            setSubmitError(error?.message || 'Failed to save Performance Indicator. Please try again.');
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
                    <label>Performance Indicator Name <span className="required">*</span></label>
                    <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                
                <div className="form-group">
                    <label>Performance Indicator Code <span className="required">*</span></label>
                    <input 
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                        className={errors.code ? 'error' : ''}
                    />
                    {errors.code && <span className="error-text">{errors.code}</span>}
                </div>
            </div>
            
            <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                />
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Performance Indicator Type</label>
                    <select 
                        value={formData.kpi_type}
                        onChange={(e) => handleChange('kpi_type', e.target.value)}
                    >
                        {kpiTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Calculation Logic</label>
                    <select 
                        value={formData.calculation_logic}
                        onChange={(e) => handleChange('calculation_logic', e.target.value)}
                    >
                        {calculationLogics.map(logic => (
                            <option key={logic.value} value={logic.value}>{logic.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Measure Type</label>
                    <select 
                        value={formData.measure_type}
                        onChange={(e) => handleChange('measure_type', e.target.value)}
                    >
                        {measureTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label>Unit</label>
                <input 
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    placeholder="e.g., KES, %, people, days"
                />
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

export default KPIEditBasic;