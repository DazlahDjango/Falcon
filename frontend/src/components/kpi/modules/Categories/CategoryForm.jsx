import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const CATEGORY_TYPES = [
    { value: 'FINANCIAL', label: 'Financial', color: '#10b981' },
    { value: 'IMPACT', label: 'Impact / Outcomes', color: '#8b5cf6' },
    { value: 'OPERATIONAL', label: 'Operational', color: '#3b82f6' },
    { value: 'CUSTOMER', label: 'Customer / Stakeholder', color: '#f59e0b' },
    { value: 'INTERNAL', label: 'Internal Process', color: '#ef4444' },
    { value: 'GROWTH', label: 'Growth & Learning', color: '#06b6d4' },
    { value: 'COMPLIANCE', label: 'Compliance & Risk', color: '#6b7280' },
];

const CategoryForm = ({ frameworks, selectedFramework, categories, initialData, onSubmit, onCancel, title }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        framework: initialData?.framework || selectedFramework || '',
        parent: initialData?.parent || '',
        category_type: initialData?.category_type || '',
        description: initialData?.description || '',
        color: initialData?.color || '#667eea',
        icon: initialData?.icon || '📁',
        display_order: initialData?.display_order || 0,
        is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Category name is required';
        if (!formData.code.trim()) newErrors.code = 'Category code is required';
        if (!formData.framework) newErrors.framework = 'Framework is required';
        if (!formData.category_type) newErrors.category_type = 'Category type is required';
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
            setErrors({ submit: err.message || 'Failed to save category' });
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

    const getParentCategories = () => {
        if (!formData.framework) return [];
        return categories.filter(cat =>
            cat.framework === formData.framework &&
            cat.id !== initialData?.id &&
            (!initialData?.parent || cat.id !== initialData.parent)
        );
    };

    return (
        <div className="category-form-container">
            <div className="form-header">
                <h2 className="form-title">{title}</h2>
                <button className="form-close" onClick={onCancel}>
                    <FiX size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            Category Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="e.g., Financial Performance"
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Category Code <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className={`form-input ${errors.code ? 'error' : ''}`}
                            placeholder="e.g., FINANCE_001"
                        />
                        {errors.code && <span className="form-error">{errors.code}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            Framework <span className="required">*</span>
                        </label>
                        <select
                            name="framework"
                            value={formData.framework}
                            onChange={handleChange}
                            className={`form-select ${errors.framework ? 'error' : ''}`}
                            disabled={!!initialData}
                        >
                            <option value="">Select a framework</option>
                            {frameworks.map(fw => (
                                <option key={fw.id} value={fw.id}>
                                    {fw.name} ({fw.code})
                                </option>
                            ))}
                        </select>
                        {errors.framework && <span className="form-error">{errors.framework}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Parent Category</label>
                        <select
                            name="parent"
                            value={formData.parent}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">None (Root Level)</option>
                            {getParentCategories().map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {'—'.repeat(cat.level || 0)} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            Category Type <span className="required">*</span>
                        </label>
                        <select
                            name="category_type"
                            value={formData.category_type}
                            onChange={handleChange}
                            className={`form-select ${errors.category_type ? 'error' : ''}`}
                        >
                            <option value="">Select type</option>
                            {CATEGORY_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        {errors.category_type && <span className="form-error">{errors.category_type}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Display Order</label>
                        <input
                            type="number"
                            name="display_order"
                            value={formData.display_order}
                            onChange={handleChange}
                            className="form-input"
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Color (Hex)</label>
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="#667eea"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Icon</label>
                        <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="📁"
                            maxLength="2"
                        />
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
                        placeholder="Describe the purpose and scope of this category..."
                    />
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
                    <span className="form-hint">Inactive categories won't appear in KPI creation forms</span>
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
                        {isSubmitting ? 'Saving...' : (initialData ? 'Update Category' : 'Create Category')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;