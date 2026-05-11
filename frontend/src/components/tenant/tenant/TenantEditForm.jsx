// frontend/src/components/tenant/tenant/TenantEditForm.jsx
import React, { useState, useEffect } from 'react';
import './tenant.css';

const TenantEditForm = ({ tenant, onSubmit, onCancel, loading, error }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        subscription_plan: '',
        contact_email: '',
        is_active: true,
        is_verified: false
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                slug: tenant.slug || '',
                domain: tenant.domain || '',
                subscription_plan: tenant.subscription_plan || 'trial',
                contact_email: tenant.contact_email || '',
                is_active: tenant.is_active ?? true,
                is_verified: tenant.is_verified ?? false
            });
        }
    }, [tenant]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({ ...prev, [name]: val }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Company name is required';
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'Contact email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'Invalid email format';
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
            {error && (
                <div className="tenant-error-banner">
                    <p>{error}</p>
                </div>
            )}
            
            <div className="tenant-form-section">
                <h4 className="tenant-section-title">General Information</h4>
                <div className="tenant-form-grid">
                    {/* Company Name */}
                    <div className="tenant-form-group">
                        <label className="tenant-label tenant-label-required">Company Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`tenant-input ${errors.name ? 'tenant-input-error' : ''}`}
                            placeholder="Acme Corporation"
                            required
                        />
                        {errors.name && <p className="tenant-error-message">{errors.name}</p>}
                    </div>

                    {/* Slug */}
                    <div className="tenant-form-group">
                        <label className="tenant-label tenant-label-required">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className={`tenant-input ${errors.slug ? 'tenant-input-error' : ''}`}
                            placeholder="acme-corp"
                            required
                        />
                        <p className="tenant-hint">Used in URLs: /{formData.slug}/</p>
                        {errors.slug && <p className="tenant-error-message">{errors.slug}</p>}
                    </div>

                    {/* Contact Email */}
                    <div className="tenant-form-group">
                        <label className="tenant-label tenant-label-required">Contact Email</label>
                        <input
                            type="email"
                            name="contact_email"
                            value={formData.contact_email}
                            onChange={handleChange}
                            className={`tenant-input ${errors.contact_email ? 'tenant-input-error' : ''}`}
                            placeholder="admin@acme.com"
                            required
                        />
                        {errors.contact_email && <p className="tenant-error-message">{errors.contact_email}</p>}
                    </div>

                    {/* Domain */}
                    <div className="tenant-form-group">
                        <label className="tenant-label">Custom Domain</label>
                        <div className="tenant-domain-group">
                            <span className="tenant-domain-prefix">https://</span>
                            <input
                                type="text"
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                className="tenant-input tenant-domain-input"
                                placeholder="custom.domain.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="tenant-form-section">
                <h4 className="tenant-section-title">Subscription & Status</h4>
                <div className="tenant-form-grid">
                    {/* Subscription Plan */}
                    <div className="tenant-form-group">
                        <label className="tenant-label">Subscription Plan</label>
                        <select
                            name="subscription_plan"
                            value={formData.subscription_plan}
                            onChange={handleChange}
                            className="tenant-select"
                        >
                            <option value="trial">Trial (30 days)</option>
                            <option value="basic">Basic - $49/month</option>
                            <option value="professional">Professional - $99/month</option>
                            <option value="enterprise">Enterprise - Custom</option>
                        </select>
                    </div>

                    {/* Status Toggles */}
                    <div className="tenant-form-group">
                        <label className="tenant-label">Account Status</label>
                        <div className="tenant-toggle-group">
                            <label className="tenant-toggle">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span className="tenant-toggle-slider"></span>
                                <span className="tenant-toggle-label">Active</span>
                            </label>
                            
                            <label className="tenant-toggle">
                                <input
                                    type="checkbox"
                                    name="is_verified"
                                    checked={formData.is_verified}
                                    onChange={handleChange}
                                />
                                <span className="tenant-toggle-slider"></span>
                                <span className="tenant-toggle-label">Verified</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Footer */}
            <div className="tenant-form-footer">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="tenant-btn tenant-btn-secondary"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="tenant-btn tenant-btn-primary"
                >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default TenantEditForm;