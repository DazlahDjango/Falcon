import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const TemplateForm = ({ template, sectors, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: template?.name || '',
        code: template?.code || '',
        sector_id: template?.sector || '',
        category_id: template?.category || '',
        description: template?.description || '',
        difficulty: template?.difficulty || 'INTERMEDIATE',
        kpi_definition: template?.kpi_definition || {
            name: '',
            description: '',
            kpi_type: 'PERCENTAGE',
            calculation_logic: 'HIGHER_IS_BETTER'
        }
    });
    const [errors, setErrors] = useState({});
    const [showJsonEditor, setShowJsonEditor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const difficulties = [
        { value: 'BEGINNER', label: 'Beginner' },
        { value: 'INTERMEDIATE', label: 'Intermediate' },
        { value: 'ADVANCED', label: 'Advanced' }
    ];

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Template name is required';
        if (!formData.code.trim()) newErrors.code = 'Template code is required';
        if (!formData.sector_id) newErrors.sector_id = 'Please select a sector';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSubmitError(null);
        setIsLoading(true);

        try {
            console.log('Submitting template form:', formData);
            await onSubmit(formData);
            console.log('Template submission successful');
        } catch (error) {
            console.error('Template submission error:', error);
            setSubmitError(error?.message || 'Failed to submit template. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateKpiDefinition = (field, value) => {
        setFormData({
            ...formData,
            kpi_definition: { ...formData.kpi_definition, [field]: value }
        });
    };

    return (
        <div className="kpi-template-form-modal">
            <div className="kpi-template-form-container">
                <div className="kpi-template-form-header">
                    <h3>{template ? 'Edit Template' : 'Create Template'}</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-template-form-body">
                    {submitError && (
                        <div className="form-error-alert">
                            <span>{submitError}</span>
                            <button type="button" className="close" onClick={() => setSubmitError(null)}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Template Name <span className="required">*</span></label>
                            <input 
                                type="text"
                                className={errors.name ? 'error' : ''}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Sales Performance Template"
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label>Template Code <span className="required">*</span></label>
                            <input 
                                type="text"
                                className={errors.code ? 'error' : ''}
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g., SALES_TMPL"
                            />
                            {errors.code && <span className="error">{errors.code}</span>}
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Sector <span className="required">*</span></label>
                            <select 
                                className={errors.sector_id ? 'error' : ''}
                                value={formData.sector_id}
                                onChange={(e) => setFormData({ ...formData, sector_id: e.target.value })}
                            >
                                <option value="">Select a sector...</option>
                                {sectors?.map(sector => (
                                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                                ))}
                            </select>
                            {errors.sector_id && <span className="error">{errors.sector_id}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label>Category (Optional)</label>
                            <select 
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Select a category...</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="2"
                            placeholder="Describe this template..."
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Difficulty Level</label>
                        <select 
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                            {difficulties.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-section">
                        <div className="form-section-header">
                            <h4>KPI Definition Template</h4>
                            <button type="button" onClick={() => setShowJsonEditor(!showJsonEditor)}>
                                {showJsonEditor ? 'Hide JSON Editor' : 'Show JSON Editor'}
                            </button>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Default Performance Indicator Name</label>
                                <input 
                                    type="text"
                                    value={formData.kpi_definition.name}
                                    onChange={(e) => updateKpiDefinition('name', e.target.value)}
                                    placeholder="Name for the created Performance Indicator"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Default Performance Indicator Type</label>
                                <select 
                                    value={formData.kpi_definition.kpi_type}
                                    onChange={(e) => updateKpiDefinition('kpi_type', e.target.value)}
                                >
                                    <option value="PERCENTAGE">Percentage</option>
                                    <option value="COUNT">Count / Number</option>
                                    <option value="FINANCIAL">Financial Amount</option>
                                    <option value="TIME">Time / Turnaround</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Default Description</label>
                            <textarea 
                                value={formData.kpi_definition.description}
                                onChange={(e) => updateKpiDefinition('description', e.target.value)}
                                rows="2"
                                placeholder="Description template"
                            />
                        </div>
                        
                        {showJsonEditor && (
                            <div className="form-group">
                                <label>Full JSON Definition</label>
                                <textarea 
                                    className="json-editor"
                                    value={JSON.stringify(formData.kpi_definition, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            setFormData({ ...formData, kpi_definition: parsed });
                                        } catch (err) {
                                            // Invalid JSON, ignore
                                        }
                                    }}
                                    rows="10"
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="kpi-template-form-footer">
                    <button className="cancel" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button 
                        className="submit" 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        type="button"
                    >
                        <FiSave size={14} />
                        {isLoading ? 'Submitting...' : (template ? 'Update' : 'Create')} Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateForm;