// frontend/src/components/tenant/tenant/TenantEditForm.jsx 
import React, { useState, useEffect } from 'react';
import './tenant.css';

const TenantEditForm = ({ tenant, onSubmit, onCancel, loading, error }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        subscription_plan: 'trial',
        is_active: true,
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        country: '',
    });

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                slug: tenant.slug || '',
                domain: tenant.domain || '',
                subscription_plan: tenant.subscription_plan || 'trial',
                is_active: tenant.is_active ?? true,
                contact_email: tenant.contact_email || '',
                contact_phone: tenant.contact_phone || '',
                address: tenant.address || '',
                city: tenant.city || '',
                country: tenant.country || '',
            });
        }
    }, [tenant]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="tenant-form">
            {error && <div className="tenant-error">{error}</div>}
            
            <div className="tenant-form-grid">
                <div className="tenant-form-group">
                    <label className="tenant-label">Company Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">Slug *</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">Domain</label>
                    <input
                        type="text"
                        name="domain"
                        value={formData.domain}
                        onChange={handleChange}
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">Subscription Plan</label>
                    <select
                        name="subscription_plan"
                        value={formData.subscription_plan}
                        onChange={handleChange}
                        className="tenant-select"
                    >
                        <option value="trial">Trial</option>
                        <option value="basic">Basic</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">Contact Email</label>
                    <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">Contact Phone</label>
                    <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group full-width">
                    <label className="tenant-label">Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="tenant-textarea"
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group">
                    <label className="tenant-label">Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="tenant-input"
                    />
                </div>

                <div className="tenant-form-group full-width">
                    <label className="tenant-checkbox">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />
                        <span>Active</span>
                    </label>
                </div>
            </div>

            <div className="tenant-form-footer">
                <button type="button" onClick={onCancel} className="tenant-btn tenant-btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="tenant-btn tenant-btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default TenantEditForm;
