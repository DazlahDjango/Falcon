import React, { useState } from 'react';
import './tenant.css';

const TenantCreateForm = ({ onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        subscription_plan: 'trial',
        contact_email: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="tenant-form">
            <div className="tenant-form-grid">
                <div className="tenant-form-group">
                    <label className="tenant-label">Company Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="tenant-input" />
                </div>
                <div className="tenant-form-group">
                    <label className="tenant-label">Slug *</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="tenant-input" />
                </div>
                <div className="tenant-form-group">
                    <label className="tenant-label">Domain</label>
                    <input type="text" name="domain" value={formData.domain} onChange={handleChange} className="tenant-input" />
                </div>
                <div className="tenant-form-group">
                    <label className="tenant-label">Subscription Plan</label>
                    <select name="subscription_plan" value={formData.subscription_plan} onChange={handleChange} className="tenant-select">
                        <option value="trial">Trial</option>
                        <option value="basic">Basic</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>
                <div className="tenant-form-group">
                    <label className="tenant-label">Contact Email</label>
                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="tenant-input" />
                </div>
            </div>
            <div className="tenant-form-footer">
                <button type="button" onClick={onCancel} className="tenant-btn tenant-btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="tenant-btn tenant-btn-primary">
                    {loading ? 'Creating...' : 'Create Tenant'}
                </button>
            </div>
        </form>
    );
};

export default TenantCreateForm;
