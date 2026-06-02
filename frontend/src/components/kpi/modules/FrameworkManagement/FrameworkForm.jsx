import React, { useState } from 'react';

const FrameworkForm = ({ sectors, initialData, onSubmit, onCancel, title }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        sector: initialData?.sector || '',
        description: initialData?.description || '',
        version: initialData?.version || '1.0.0',
        ...initialData,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Framework name is required';
        if (!formData.code.trim()) newErrors.code = 'Framework code is required';
        if (!formData.sector) newErrors.sector = 'Sector is required';
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
            setErrors({ submit: err.message || 'Failed to save framework' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) delete errors[name];
    };

    return (
        <div className="framework-form-container">
            <div className="form-header">
                <h2 className="form-title">{title}</h2>
                <button className="form-close" onClick={onCancel}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="framework-form">
                <div className="form-group">
                    <label className="form-label">
                        Framework Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="e.g., Startup Growth Framework"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Framework Code <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className={`form-input ${errors.code ? 'error' : ''}`}
                        placeholder="e.g., STARTUP_V1"
                    />
                    {errors.code && <span className="form-error">{errors.code}</span>}
                    <span className="form-hint">Use uppercase letters, numbers, and underscores only</span>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Sector <span className="required">*</span>
                    </label>
                    <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        className={`form-select ${errors.sector ? 'error' : ''}`}
                    >
                        <option value="">Select a sector</option>
                        {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {sector.name} ({sector.code})
                            </option>
                        ))}
                    </select>
                    {errors.sector && <span className="form-error">{errors.sector}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Version</label>
                    <input
                        type="text"
                        name="version"
                        value={formData.version}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g., 1.0.0"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="4"
                        placeholder="Describe the purpose and scope of this framework..."
                    />
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
                        {isSubmitting ? 'Saving...' : (initialData ? 'Update Framework' : 'Create Framework')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FrameworkForm;