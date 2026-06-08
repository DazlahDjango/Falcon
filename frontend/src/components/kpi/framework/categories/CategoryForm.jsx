import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const CategoryForm = ({ category, parentCategory, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        code: category?.code || '',
        category_type: category?.category_type || 'OPERATIONAL',
        parent: category?.parent || parentCategory?.id || null,
        description: category?.description || '',
        color: category?.color || '#3b82f6',
        is_active: category?.is_active ?? true
    });
    const [errors, setErrors] = useState({});

    const categoryTypes = [
        { value: 'FINANCIAL', label: 'Financial' },
        { value: 'IMPACT', label: 'Impact / Outcomes' },
        { value: 'OPERATIONAL', label: 'Operational' },
        { value: 'CUSTOMER', label: 'Customer / Stakeholder' },
        { value: 'INTERNAL', label: 'Internal Process' },
        { value: 'GROWTH', label: 'Growth & Learning' },
        { value: 'COMPLIANCE', label: 'Compliance & Risk' }
    ];

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Category name is required';
        if (!formData.code.trim()) newErrors.code = 'Category code is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="kpi-category-form-modal">
            <div className="kpi-category-form-container">
                <div className="kpi-category-form-header">
                    <h3>{category ? 'Edit Category' : 'Create Category'}</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-category-form-body">
                    <div className="form-group">
                        <label>Category Name <span className="required">*</span></label>
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
                        <label>Category Code <span className="required">*</span></label>
                        <input 
                            type="text"
                            className={errors.code ? 'error' : ''}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., REV_GROWTH"
                        />
                        {errors.code && <span className="error">{errors.code}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Category Type</label>
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
                        <label>Parent Category</label>
                        <select 
                            value={formData.parent || ''}
                            onChange={(e) => setFormData({ ...formData, parent: e.target.value || null })}
                        >
                            <option value="">None (Root Category)</option>
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
                            placeholder="Describe this category..."
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
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="submit" onClick={handleSubmit}>
                        <FiSave size={14} />
                        {category ? 'Update' : 'Create'} Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;