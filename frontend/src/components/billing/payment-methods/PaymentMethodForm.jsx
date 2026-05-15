import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const PaymentMethodForm = ({ onSubmit, loading = false, onCancel }) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
            newErrors.cardNumber = 'Valid card number required';
        }
        if (!formData.cardName) {
            newErrors.cardName = 'Name on card required';
        }
        if (!formData.expiryMonth || !formData.expiryYear) {
            newErrors.expiry = 'Expiry date required';
        }
        if (!formData.cvv || formData.cvv.length < 3) {
            newErrors.cvv = 'Valid CVV required';
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

    const formatCardNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        const groups = numbers.match(/.{1,4}/g);
        return groups ? groups.join(' ') : numbers;
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

    return (
        <form className="payment-method-form" onSubmit={handleSubmit}>
            <div className="payment-method-form-group">
                <label className="payment-method-form-label">Card Number</label>
                <input
                    type="text"
                    className={`payment-method-form-input ${errors.cardNumber ? 'error' : ''}`}
                    value={formData.cardNumber}
                    onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                />
                {errors.cardNumber && <span className="payment-method-form-error">{errors.cardNumber}</span>}
            </div>

            <div className="payment-method-form-group">
                <label className="payment-method-form-label">Name on Card</label>
                <input
                    type="text"
                    className={`payment-method-form-input ${errors.cardName ? 'error' : ''}`}
                    value={formData.cardName}
                    onChange={(e) => handleChange('cardName', e.target.value)}
                    placeholder="John Doe"
                />
                {errors.cardName && <span className="payment-method-form-error">{errors.cardName}</span>}
            </div>

            <div className="payment-method-form-row">
                <div className="payment-method-form-group">
                    <label className="payment-method-form-label">Expiry Date</label>
                    <div className="payment-method-form-expiry">
                        <select
                            className={`payment-method-form-select ${errors.expiry ? 'error' : ''}`}
                            value={formData.expiryMonth}
                            onChange={(e) => handleChange('expiryMonth', e.target.value)}
                        >
                            <option value="">MM</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <span>/</span>
                        <select
                            className={`payment-method-form-select ${errors.expiry ? 'error' : ''}`}
                            value={formData.expiryYear}
                            onChange={(e) => handleChange('expiryYear', e.target.value)}
                        >
                            <option value="">YY</option>
                            {years.map(year => (
                                <option key={year} value={year}>{String(year).slice(-2)}</option>
                            ))}
                        </select>
                    </div>
                    {errors.expiry && <span className="payment-method-form-error">{errors.expiry}</span>}
                </div>

                <div className="payment-method-form-group">
                    <label className="payment-method-form-label">CVV</label>
                    <input
                        type="password"
                        className={`payment-method-form-input ${errors.cvv ? 'error' : ''}`}
                        value={formData.cvv}
                        onChange={(e) => handleChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                    />
                    {errors.cvv && <span className="payment-method-form-error">{errors.cvv}</span>}
                </div>
            </div>

            <div className="payment-method-form-actions">
                {onCancel && (
                    <button type="button" className="payment-method-cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>
                )}
                <button type="submit" className="payment-method-submit-btn" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Card'}
                </button>
            </div>
        </form>
    );
};

PaymentMethodForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default PaymentMethodForm;