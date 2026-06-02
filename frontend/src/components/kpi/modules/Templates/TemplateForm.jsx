import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const KPI_TYPES = [
    { value: 'COUNT', label: 'Count / Number' },
    { value: 'PERCENTAGE', label: 'Percentage (%)' },
    { value: 'FINANCIAL', label: 'Financial Amount' },
    { value: 'MILESTONE', label: 'Yes / No Milestone' },
    { value: 'TIME', label: 'Time / Turnaround' },
    { value: 'IMPACT', label: 'Impact Score' },
];

const CALCULATION_LOGIC = [
    { value: 'HIGHER_IS_BETTER', label: 'Higher is Better' },
    { value: 'LOWER_IS_BETTER', label: 'Lower is Better' },
];

const MEASURE_TYPE = [
    { value: 'CUMULATIVE', label: 'Cumulative (YTD)' },
    { value: 'NON_CUMULATIVE', label: 'Non-Cumulative (Period Only)' },
];

const DIFFICULTY = [
    { value: 'BEGINNER', label: 'Beginner', icon: '🌱' },
    { value: 'INTERMEDIATE', label: 'Intermediate', icon: '📈' },
    { value: 'ADVANCED', label: 'Advanced', icon: '🚀' },
];

const TemplateForm = ({ sectors, initialData, onSubmit, onCancel, title }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        sector: initialData?.sector || '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        difficulty: initialData?.difficulty || 'INTERMEDIATE',
        kpi_definition: initialData?.kpi_definition || {
            kpi_type: 'COUNT',
            calculation_logic: 'HIGHER_IS_BETTER',
            measure_type: 'CUMULATIVE',
            unit: '',
            decimal_places: 2,
            target_min: null,
            target_max: null,
        },
        target_phasing_pattern: initialData?.target_phasing_pattern || {
            strategy: 'equal_split',
            custom_pattern: null,
        },
        metadata: initialData?.metadata || {},
        is_published: initialData?.is_published || false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Template name is required';
        if (!formData.code.trim()) newErrors.code = 'Template code is required';
        if (!formData.sector) newErrors.sector = 'Sector is required';
        if (!formData.kpi_definition.kpi_type) newErrors.kpi_type = 'KPI type is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setErrors({ submit: err.message || 'Failed to save template' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) delete errors[name];
    };

    const handleKpiDefChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            kpi_definition: { ...prev.kpi_definition, [field]: value }
        }));
    };

    const renderStep1 = () => (
        <>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Template Name <span className="required">*</span></label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="e.g., Revenue Growth Template"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Template Code <span className="required">*</span></label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className={`form-input ${errors.code ? 'error' : ''}`}
                        placeholder="e.g., REV_GROWTH_V1"
                    />
                    {errors.code && <span className="form-error">{errors.code}</span>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Sector <span className="required">*</span></label>
                    <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        className={`form-select ${errors.sector ? 'error' : ''}`}
                    >
                        <option value="">Select a sector</option>
                        {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {sector.name}
                            </option>
                        ))}
                    </select>
                    {errors.sector && <span className="form-error">{errors.sector}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <div className="difficulty-selector">
                        {DIFFICULTY.map(diff => (
                            <button
                                key={diff.value}
                                type="button"
                                className={`difficulty-option ${formData.difficulty === diff.value ? 'selected' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.value }))}
                            >
                                <span>{diff.icon}</span>
                                <span>{diff.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe what this KPI template is for and when to use it..."
                />
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">KPI Type <span className="required">*</span></label>
                    <select
                        value={formData.kpi_definition.kpi_type}
                        onChange={(e) => handleKpiDefChange('kpi_type', e.target.value)}
                        className="form-select"
                    >
                        {KPI_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Calculation Logic</label>
                    <select
                        value={formData.kpi_definition.calculation_logic}
                        onChange={(e) => handleKpiDefChange('calculation_logic', e.target.value)}
                        className="form-select"
                    >
                        {CALCULATION_LOGIC.map(logic => (
                            <option key={logic.value} value={logic.value}>
                                {logic.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Measure Type</label>
                    <select
                        value={formData.kpi_definition.measure_type}
                        onChange={(e) => handleKpiDefChange('measure_type', e.target.value)}
                        className="form-select"
                    >
                        {MEASURE_TYPE.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                        type="text"
                        value={formData.kpi_definition.unit}
                        onChange={(e) => handleKpiDefChange('unit', e.target.value)}
                        className="form-input"
                        placeholder="e.g., KES, %, people"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Target Min</label>
                    <input
                        type="number"
                        value={formData.kpi_definition.target_min || ''}
                        onChange={(e) => handleKpiDefChange('target_min', e.target.value ? parseFloat(e.target.value) : null)}
                        className="form-input"
                        placeholder="Minimum acceptable value"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Target Max</label>
                    <input
                        type="number"
                        value={formData.kpi_definition.target_max || ''}
                        onChange={(e) => handleKpiDefChange('target_max', e.target.value ? parseFloat(e.target.value) : null)}
                        className="form-input"
                        placeholder="Maximum target value"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Decimal Places</label>
                <input
                    type="number"
                    value={formData.kpi_definition.decimal_places}
                    onChange={(e) => handleKpiDefChange('decimal_places', parseInt(e.target.value))}
                    className="form-input"
                    min="0"
                    max="4"
                />
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
            <div className="form-group">
                <label className="form-label">Phasing Strategy</label>
                <select
                    value={formData.target_phasing_pattern.strategy}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        target_phasing_pattern: { ...prev.target_phasing_pattern, strategy: e.target.value }
                    }))}
                    className="form-select"
                >
                    <option value="equal_split">Equal Split - Distribute evenly across months</option>
                    <option value="seasonal">Seasonal - Weighted by seasonal patterns</option>
                    <option value="custom_pattern">Custom - Define custom monthly distribution</option>
                </select>
            </div>

            {formData.target_phasing_pattern.strategy === 'custom_pattern' && (
                <div className="form-group">
                    <label className="form-label">Custom Monthly Pattern (%)</label>
                    <div className="custom-pattern-inputs">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <div key={month} className="pattern-input">
                                <label>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</label>
                                <input
                                    type="number"
                                    value={formData.target_phasing_pattern.custom_pattern?.[month] || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        target_phasing_pattern: {
                                            ...prev.target_phasing_pattern,
                                            custom_pattern: {
                                                ...prev.target_phasing_pattern.custom_pattern,
                                                [month]: parseFloat(e.target.value) || 0
                                            }
                                        }
                                    }))}
                                    className="form-input"
                                    placeholder="%"
                                    step="1"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="template-form-container">
            <div className="form-header">
                <h2 className="form-title">{title}</h2>
                <button className="form-close" onClick={onCancel}>
                    <FiX size={20} />
                </button>
            </div>

            <div className="form-steps">
                <div className={`step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Basic Info</div>
                </div>
                <div className="step-line" />
                <div className={`step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">KPI Definition</div>
                </div>
                <div className="step-line" />
                <div className={`step ${activeStep === 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Phasing Pattern</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="template-form">
                {activeStep === 1 && renderStep1()}
                {activeStep === 2 && renderStep2()}
                {activeStep === 3 && renderStep3()}

                <div className="form-actions">
                    {activeStep > 1 && (
                        <button type="button" className="btn-secondary" onClick={() => setActiveStep(activeStep - 1)}>
                            Back
                        </button>
                    )}
                    {activeStep < 3 ? (
                        <button type="button" className="btn-primary" onClick={() => setActiveStep(activeStep + 1)}>
                            Next
                        </button>
                    ) : (
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : (initialData ? 'Update Template' : 'Create Template')}
                        </button>
                    )}
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TemplateForm;