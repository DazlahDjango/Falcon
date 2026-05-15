import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const BillingAddressForm = ({ value, onChange }) => {
    const [formData, setFormData] = useState(value || {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'KE',
    });

    const handleChange = (field, fieldValue) => {
        const newData = { ...formData, [field]: fieldValue };
        setFormData(newData);
        onChange(newData);
    };

    return (
        <div className="billing-address-form">
            <h4 className="billing-address-form-title">Billing Address</h4>
            
            <div className="billing-address-form-row">
                <div className="billing-address-form-group">
                    <label className="billing-address-form-label">Full Name</label>
                    <input
                        type="text"
                        className="billing-address-form-input"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                </div>
            </div>

            <div className="billing-address-form-row">
                <div className="billing-address-form-group">
                    <label className="billing-address-form-label">Email Address</label>
                    <input
                        type="email"
                        className="billing-address-form-input"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        required
                    />
                </div>
                <div className="billing-address-form-group">
                    <label className="billing-address-form-label">Phone Number</label>
                    <input
                        type="tel"
                        className="billing-address-form-input"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+254 700 000000"
                    />
                </div>
            </div>

            <div className="billing-address-form-group">
                <label className="billing-address-form-label">Street Address</label>
                <input
                    type="text"
                    className="billing-address-form-input"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Main St"
                />
            </div>

            <div className="billing-address-form-row">
                <div className="billing-address-form-group">
                    <label className="billing-address-form-label">City</label>
                    <input
                        type="text"
                        className="billing-address-form-input"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Nairobi"
                    />
                </div>
                <div className="billing-address-form-group">
                    <label className="billing-address-form-label">State/Province</label>
                    <input
                        type="text"
                        className="billing-address-form-input"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="Nairobi"
                    />
                </div>
                <div className="billing-address-form-group">
                    <label className="billing-address-form-label">Postal Code</label>
                    <input
                        type="text"
                        className="billing-address-form-input"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        placeholder="00100"
                    />
                </div>
            </div>

            <div className="billing-address-form-group">
                <label className="billing-address-form-label">Country</label>
                <select
                    className="billing-address-form-select"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                >
                    <option value="KE">Kenya</option>
                    <option value="UG">Uganda</option>
                    <option value="TZ">Tanzania</option>
                    <option value="NG">Nigeria</option>
                    <option value="ZA">South Africa</option>
                    <option value="GH">Ghana</option>
                </select>
            </div>
        </div>
    );
};

BillingAddressForm.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
};

export default BillingAddressForm;