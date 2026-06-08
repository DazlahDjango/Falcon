import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiSave, FiCheck } from 'react-icons/fi';

const FrameworkWizard = ({ sectors, onSubmit, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        sector_id: '',
        description: '',
        version: '1.0.0'
    });
    const [errors, setErrors] = useState({});

    const handleNext = () => {
        if (step === 1) {
            const newErrors = {};
            if (!formData.name.trim()) newErrors.name = 'Framework name is required';
            if (!formData.code.trim()) newErrors.code = 'Framework code is required';
            if (!formData.sector_id) newErrors.sector_id = 'Please select a sector';
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
        }
        setStep(step + 1);
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <div className="kpi-framework-wizard-modal">
            <div className="kpi-framework-wizard-container">
                <div className="kpi-framework-wizard-header">
                    <h3>Create Framework Wizard</h3>
                    <div className="steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Basic Info</div>
                        </div>
                        <div className="step-line" />
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Review</div>
                        </div>
                    </div>
                </div>
                
                <div className="kpi-framework-wizard-body">
                    {step === 1 && (
                        <div className="wizard-step">
                            <div className="form-group">
                                <label>Framework Name <span className="required">*</span></label>
                                <input 
                                    type="text"
                                    className={errors.name ? 'error' : ''}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Corporate Performance Framework"
                                />
                                {errors.name && <span className="error">{errors.name}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label>Framework Code <span className="required">*</span></label>
                                <input 
                                    type="text"
                                    className={errors.code ? 'error' : ''}
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CPF-2024"
                                />
                                {errors.code && <span className="error">{errors.code}</span>}
                            </div>
                            
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
                                <label>Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Describe this framework..."
                                />
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="wizard-step review">
                            <h4>Review Framework Details</h4>
                            <div className="review-item">
                                <span className="label">Name:</span>
                                <span className="value">{formData.name}</span>
                            </div>
                            <div className="review-item">
                                <span className="label">Code:</span>
                                <span className="value">{formData.code}</span>
                            </div>
                            <div className="review-item">
                                <span className="label">Sector:</span>
                                <span className="value">
                                    {sectors?.find(s => s.id === formData.sector_id)?.name}
                                </span>
                            </div>
                            <div className="review-item">
                                <span className="label">Version:</span>
                                <span className="value">{formData.version}</span>
                            </div>
                            {formData.description && (
                                <div className="review-item">
                                    <span className="label">Description:</span>
                                    <span className="value">{formData.description}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="kpi-framework-wizard-footer">
                    {step > 1 && (
                        <button className="back" onClick={() => setStep(step - 1)}>
                            <FiArrowLeft size={14} />
                            Back
                        </button>
                    )}
                    {step < 2 && (
                        <button className="next" onClick={handleNext}>
                            Next
                            <FiArrowRight size={14} />
                        </button>
                    )}
                    {step === 2 && (
                        <button className="submit" onClick={handleSubmit}>
                            <FiSave size={14} />
                            Create Framework
                        </button>
                    )}
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default FrameworkWizard;