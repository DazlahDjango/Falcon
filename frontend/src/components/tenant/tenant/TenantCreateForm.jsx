// frontend/src/components/tenant/TenantCreateForm.jsx
import React, { useState } from 'react';
import './tenant.css';  // Import the CSS

const TenantCreateForm = ({ onSubmit, onCancel, loading, error }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        subscription_plan: 'trial',
        contact_email: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-generate slug from name
        if (name === 'name') {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: value,
                slug: generatedSlug
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
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
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
            
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
                    {formData.slug && (
                        <p className="tenant-hint">
                            URL: /{formData.slug}/
                        </p>
                    )}
                    {errors.slug && <p className="tenant-error-message">{errors.slug}</p>}
                </div>

                {/* Domain */}
                <div className="tenant-form-group">
                    <label className="tenant-label">Domain</label>
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
                    <p className="tenant-hint">Optional custom domain for white-labeling</p>
                </div>

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
            </div>

            {/* Preview Section */}
            <div className="tenant-create-preview">
                <h4 className="tenant-create-preview-title">Preview</h4>
                <div className="tenant-create-preview-content">
                    <p><strong>URL:</strong> https://app.falcon.com/{formData.slug || 'your-slug'}/</p>
                    <p><strong>API Endpoint:</strong> https://api.falcon.com/v1/tenant/{formData.slug || 'your-slug'}/</p>
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
                    {loading ? 'Creating...' : 'Create Tenant'}
                </button>
            </div>
        </form>
    );
};

export default TenantCreateForm;