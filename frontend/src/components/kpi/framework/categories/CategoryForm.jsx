import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const CategoryForm = ({ category, parentCategory, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        category_type: category?.category_type || 'OPERATIONAL',
        parent: category?.parent || parentCategory?.id || null,
        description: category?.description || '',
        color: category?.color || '#3b82f6',
        is_active: category?.is_active ?? true
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const categoryTypes = [
        { value: 'FINANCIAL', label: 'Financial' },
        { value: 'IMPACT', label: 'Impact / Outcomes' },
        { value: 'OPERATIONAL', label: 'Operational' },
        { value: 'CUSTOMER', label: 'Customer / Stakeholder' },
        { value: 'INTERNAL', label: 'Internal Process' },
        { value: 'GROWTH', label: 'Growth & Learning' },
        { value: 'COMPLIANCE', label: 'Compliance & Risk' }
    ];

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Key Result Area name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSubmitError(null);
        setIsLoading(true);

        try {
            console.log('Submitting category form:', formData);
            await onSubmit(formData);
            console.log('Category submission successful');
        } catch (error) {
            console.error('Category submission error:', error);
            setSubmitError(error?.message || 'Failed to submit Key Result Area. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="kpi-category-form-modal">
            <div className="kpi-category-form-container">
                <div className="kpi-category-form-header">
                    <h3>{category ? 'Edit Key Result Area' : 'Create Key Result Area'}</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="kpi-category-form-body">
                    {submitError && (
                        <div className="form-error-alert">
                            <span>{submitError}</span>
                            <button type="button" className="close" onClick={() => setSubmitError(null)}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                    <div className="form-group">
                        <label>Key Result Area Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className={errors.name ? 'error' : ''}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Revenue Growth"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Key Result Area Type</label>
                        <select
                            value={formData.category_type}
                            onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                        >
                            {categoryTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Parent Key Result Area</label>
                        <select
                            value={formData.parent || ''}
                            onChange={(e) => setFormData({ ...formData, parent: e.target.value || null })}
                        >
                            <option value="">None (Root Key Result Area)</option>
                            {categories?.filter(c => c.id !== category?.id).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                            <span>{formData.color}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            placeholder="Describe this key result area..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            Active
                        </label>
                    </div>
                </div>

                <div className="kpi-category-form-footer">
                    <button className="cancel" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button
                        className="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        type="button"
                    >
                        <FiSave size={14} />
                        {isLoading ? 'Submitting...' : (category ? 'Update' : 'Create')} Key Result Area
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;