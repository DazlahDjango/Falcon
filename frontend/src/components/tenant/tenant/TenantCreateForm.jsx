// frontend/src/components/tenant/tenant/TenantCreateForm.jsx
import React, { useState } from 'react';
import './tenant.css';

export const TenantCreateForm = ({ onSubmit, isLoading = false, error: externalError }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        contact_email: '',
        contact_phone: '',
        subscription_plan: 'trial',
        address: '',
        city: '',
        country: 'Kenya',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        // Validate on blur
        if (name === 'slug') {
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            if (!formData.slug) {
                setErrors(prev => ({ ...prev, slug: 'Slug is required' }));
            } else if (!slugRegex.test(formData.slug)) {
                setErrors(prev => ({ ...prev, slug: 'Slug can only contain lowercase letters, numbers, and hyphens' }));
            } else {
                setErrors(prev => ({ ...prev, slug: '' }));
            }
        }

        if (name === 'contact_email') {
            const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
            if (!formData.contact_email) {
                setErrors(prev => ({ ...prev, contact_email: 'Email is required' }));
            } else if (!emailRegex.test(formData.contact_email)) {
                setErrors(prev => ({ ...prev, contact_email: 'Please enter a valid email address' }));
            } else {
                setErrors(prev => ({ ...prev, contact_email: '' }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Tenant name is required';
        if (!formData.slug) newErrors.slug = 'Slug is required';
        if (!formData.contact_email) newErrors.contact_email = 'Contact email is required';

        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (formData.contact_email && !emailRegex.test(formData.contact_email)) {
            newErrors.contact_email = 'Please enter a valid email address';
        }

        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (formData.slug && !slugRegex.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="tenant-form">
            {(externalError || Object.values(errors).some(e => e)) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-600">{externalError || 'Please fix the errors above'}</p>
                </div>
            )}

            <div className="tenant-form-group">
                <label className="tenant-form-label">Tenant Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`tenant-form-input ${errors.name && touched.name ? 'tenant-form-input-error' : ''}`}
                    placeholder="Acme Corporation"
                    disabled={isLoading}
                />
                {errors.name && touched.name && <p className="tenant-form-error">{errors.name}</p>}
            </div>

            <div className="tenant-form-group">
                <label className="tenant-form-label">Slug *</label>
                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`tenant-form-input ${errors.slug && touched.slug ? 'tenant-form-input-error' : ''}`}
                    placeholder="acme-corp"
                    disabled={isLoading}
                />
                <p className="text-xs text-gray-500">URL-friendly identifier (e.g., acme-corp)</p>
                {errors.slug && touched.slug && <p className="tenant-form-error">{errors.slug}</p>}
            </div>

            <div className="tenant-info-grid">
                <div className="tenant-form-group">
                    <label className="tenant-form-label">Contact Email *</label>
                    <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`tenant-form-input ${errors.contact_email && touched.contact_email ? 'tenant-form-input-error' : ''}`}
                        placeholder="admin@acme.com"
                        disabled={isLoading}
                    />
                    {errors.contact_email && touched.contact_email && <p className="tenant-form-error">{errors.contact_email}</p>}
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-form-label">Contact Phone</label>
                    <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className="tenant-form-input"
                        placeholder="+254 700 000000"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="tenant-form-group">
                <label className="tenant-form-label">Subscription Plan</label>
                <select
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleChange}
                    className="tenant-form-input"
                    disabled={isLoading}
                >
                    <option value="trial">Trial</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>

            <div className="tenant-info-grid">
                <div className="tenant-form-group">
                    <label className="tenant-form-label">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="tenant-form-input"
                        placeholder="Street address"
                        disabled={isLoading}
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-form-label">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="tenant-form-input"
                        placeholder="Nairobi"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="tenant-form-group">
                <label className="tenant-form-label">Country</label>
                <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="tenant-form-input"
                    placeholder="Kenya"
                    disabled={isLoading}
                />
            </div>

            <div className="tenant-form-actions">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Creating...' : 'Create Tenant'}
                </button>
            </div>
        </form>
    );
};