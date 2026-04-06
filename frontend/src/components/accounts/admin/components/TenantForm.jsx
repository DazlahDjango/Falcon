import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTenant, updateTenant } from '../../../../store/accounts/slice/adminSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';

const TenantForm = ({ initialData = {}, isEdit = false, onSubmit, onCancel }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        slug: initialData.slug || '',
        domain: initialData.domain || '',
        subscription_plan: initialData.subscription_plan || 'trial',
        settings: initialData.settings || {},
        branding: initialData.branding || {}
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Auto-generate slug from name for new tenants
        if (!isEdit && name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tenant name is required';
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            if (isEdit) {
                await dispatch(updateTenant({ id: initialData.id, ...formData })).unwrap();
                dispatch(showAlert({ type: 'success', message: 'Tenant updated successfully' }));
            } else {
                await dispatch(createTenant(formData)).unwrap();
                dispatch(showAlert({ type: 'success', message: 'Tenant created successfully' }));
            }
            onSubmit();
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Operation failed' }));
        } finally {
            setIsSubmitting(false);
        }
    };
    const plans = [
        { value: 'trial', label: 'Trial (14 days)' },
        { value: 'basic', label: 'Basic' },
        { value: 'professional', label: 'Professional' },
        { value: 'enterprise', label: 'Enterprise' }
    ];
    return (
        <form onSubmit={handleSubmit} className="tenant-form">
            <div className="form-group">
                <label>Tenant Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Acme Corporation"
                />
                {errors.name && <div className="input-feedback error">{errors.name}</div>}
            </div>
            <div className="form-group">
                <label>Slug *</label>
                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={`form-input ${errors.slug ? 'is-invalid' : ''}`}
                    placeholder="acme-corp"
                    disabled={isEdit}
                />
                {errors.slug && <div className="input-feedback error">{errors.slug}</div>}
                <small>Used in URLs and API endpoints (cannot be changed after creation)</small>
            </div>
            <div className="form-group">
                <label>Domain (optional)</label>
                <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="acme.falconpms.com"
                />
                <small>Custom domain for the tenant</small>
            </div>
            <div className="form-group">
                <label>Subscription Plan</label>
                <select
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleChange}
                    className="form-input"
                >
                    {plans.map(plan => (
                        <option key={plan.value} value={plan.value}>{plan.label}</option>
                    ))}
                </select>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (isEdit ? 'Update Tenant' : 'Create Tenant')}
                </button>
            </div>
        </form>
    );
};
export default TenantForm;