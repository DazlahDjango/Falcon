import React, { useState } from 'react';
import { FiMapPin, FiGlobe, FiMail, FiUser, FiSave } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import './checkout.css';

export const BillingAddressForm = ({ initialData = {}, onSave, onCancel, saving = false }) => {
    const [formData, setFormData] = useState({
        fullName: initialData.fullName || '', email: initialData.email || '', company: initialData.company || '', taxId: initialData.taxId || '', address: initialData.address || '', city: initialData.city || '', state: initialData.state || '', postalCode: initialData.postalCode || '', country: initialData.country || 'KE'
    });
    const [errors, setErrors] = useState({});

    const countries = [{ code: 'KE', name: 'Kenya' }, { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'ZA', name: 'South Africa' }, { code: 'CI', name: 'Côte d\'Ivoire' }];

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.country) newErrors.country = 'Country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(formData); };

    return (
        <div className="billing-address-form">
            <h3>Billing Address</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-row"><div className="form-group"><label>Full Name <span className="required">*</span></label><div className="input-with-icon"><FiUser /><input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={errors.fullName ? 'error' : ''} /></div>{errors.fullName && <span className="error-message">{errors.fullName}</span>}</div><div className="form-group"><label>Email Address <span className="required">*</span></label><div className="input-with-icon"><FiMail /><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={errors.email ? 'error' : ''} /></div>{errors.email && <span className="error-message">{errors.email}</span>}</div></div>
                <div className="form-row"><div className="form-group"><label>Company (Optional)</label><div className="input-with-icon"><FaBuilding /><input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div></div><div className="form-group"><label>Tax ID / VAT Number</label><input type="text" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} placeholder="KRA PIN / VAT ID" /></div></div>
                <div className="form-group"><label>Street Address <span className="required">*</span></label><div className="input-with-icon"><FiMapPin /><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={errors.address ? 'error' : ''} /></div>{errors.address && <span className="error-message">{errors.address}</span>}</div>
                <div className="form-row"><div className="form-group"><label>City <span className="required">*</span></label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={errors.city ? 'error' : ''} /></div><div className="form-group"><label>State / Province</label><input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} /></div><div className="form-group"><label>Postal Code</label><input type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} /></div></div>
                <div className="form-group"><label>Country <span className="required">*</span></label><div className="input-with-icon"><FiGlobe /><select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className={errors.country ? 'error' : ''}>{countries.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}</select></div>{errors.country && <span className="error-message">{errors.country}</span>}</div>
                <div className="form-actions"><button type="button" onClick={onCancel} className="cancel-btn">Cancel</button><button type="submit" className="save-btn" disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save Billing Address'}</button></div>
            </form>
        </div>
    );
};

export default BillingAddressForm;