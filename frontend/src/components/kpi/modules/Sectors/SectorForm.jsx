import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const SECTOR_TYPES = [
    { value: 'COMMERCIAL', label: 'Commercial / Corporate', icon: '🏢', color: '#667eea' },
    { value: 'NGO', label: 'NGO / Non-Profit', icon: '🤝', color: '#10b981' },
    { value: 'PUBLIC', label: 'Public Sector / Government', icon: '🏛️', color: '#3b82f6' },
    { value: 'CONSULTING', label: 'Consulting / Professional Services', icon: '💼', color: '#8b5cf6' },
];

const SectorForm = ({ initialData, onSubmit, onCancel, title }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        sector_type: initialData?.sector_type || '',
        description: initialData?.description || '',
        icon: initialData?.icon || '🏭',
        metadata: initialData?.metadata || {
            default_calculation_logic: 'HIGHER_IS_BETTER',
            typical_kpi_types: [],
            recommended_thresholds: {
                green: 90,
                yellow: 50
            }
        },
        is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedType, setSelectedType] = useState(formData.sector_type);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Sector name is required';
        if (!formData.code.trim()) newErrors.code = 'Sector code is required';
        if (!formData.sector_type) newErrors.sector_type = 'Sector type is required';
        if (formData.code && !/^[A-Z0-9_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
        }
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
            setErrors({ submit: err.message || 'Failed to save sector' });
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

    const handleTypeSelect = (typeValue) => {
        const selected = SECTOR_TYPES.find(t => t.value === typeValue);
        setSelectedType(typeValue);
        setFormData(prev => ({
            ...prev,
            sector_type: typeValue,
            icon: selected?.icon || '🏭'
        }));
    };

    const getTypeIcon = (typeValue) => {
        const found = SECTOR_TYPES.find(t => t.value === typeValue);
        return found?.icon || '🏭';
    };

    return (
        <div className="sector-form-container">
            <div className="form-header">
                <h2 className="form-title">{title}</h2>
                <button className="form-close" onClick={onCancel}>
                    <FiX size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="sector-form">
                <div className="form-group">
                    <label className="form-label">Sector Type <span className="required">*</span></label>
                    <div className="sector-type-selector">
                        {SECTOR_TYPES.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                className={`type-option ${selectedType === type.value ? 'selected' : ''}`}
                                onClick={() => handleTypeSelect(type.value)}
                                style={{ borderColor: selectedType === type.value ? type.color : '#e9ecef' }}
                            >
                                <span className="type-icon">{type.icon}</span>
                                <span className="type-label">{type.label}</span>
                            </button>
                        ))}
                    </div>
                    {errors.sector_type && <span className="form-error">{errors.sector_type}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            Sector Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="e.g., Commercial / Corporate"
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Sector Code <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className={`form-input ${errors.code ? 'error' : ''}`}
                            placeholder="e.g., COMMERCIAL"
                        />
                        {errors.code && <span className="form-error">{errors.code}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="4"
                        placeholder="Describe the characteristics and typical organizations in this sector..."
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Icon</label>
                    <div className="icon-input-wrapper">
                        <span className="icon-preview">{formData.icon}</span>
                        <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="🏭"
                            maxLength="2"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-subtitle">KPI Default Settings</h3>

                    <div className="form-group">
                        <label className="form-label">Default Calculation Logic</label>
                        <select
                            name="default_calculation_logic"
                            value={formData.metadata?.default_calculation_logic || 'HIGHER_IS_BETTER'}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                metadata: { ...prev.metadata, default_calculation_logic: e.target.value }
                            }))}
                            className="form-select"
                        >
                            <option value="HIGHER_IS_BETTER">Higher is Better</option>
                            <option value="LOWER_IS_BETTER">Lower is Better</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Green Threshold (%)</label>
                            <input
                                type="number"
                                value={formData.metadata?.recommended_thresholds?.green || 90}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    metadata: {
                                        ...prev.metadata,
                                        recommended_thresholds: {
                                            ...prev.metadata?.recommended_thresholds,
                                            green: parseInt(e.target.value)
                                        }
                                    }
                                }))}
                                className="form-input"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Yellow Threshold (%)</label>
                            <input
                                type="number"
                                value={formData.metadata?.recommended_thresholds?.yellow || 50}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    metadata: {
                                        ...prev.metadata,
                                        recommended_thresholds: {
                                            ...prev.metadata?.recommended_thresholds,
                                            yellow: parseInt(e.target.value)
                                        }
                                    }
                                }))}
                                className="form-input"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-checkbox">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />
                        <span>Active</span>
                    </label>
                    <span className="form-hint">Inactive sectors won't appear in framework creation forms</span>
                </div>

                {errors.submit && (
                    <div className="alert-error">
                        <span className="alert-icon">⚠️</span>
                        {errors.submit}
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (initialData ? 'Update Sector' : 'Create Sector')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SectorForm;