import React, { useState } from 'react';
import { FiCreditCard, FiLock } from 'react-icons/fi';
import { usePaymentMethods } from '../../../hooks/billing/usePaymentMethods';
import { CardBrandIcon } from '../shared/CardBrandIcon';
import './payment-methods.css';

export const PaymentMethodForm = ({ onSuccess, onCancel, initialEmail = '' }) => {
    const { addPaymentMethod, loading } = usePaymentMethods();
    const [formData, setFormData] = useState({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', cardHolder: '', email: initialEmail });
    const [errors, setErrors] = useState({});
    const [cardBrand, setCardBrand] = useState(null);

    const detectCardBrand = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'american express';
        if (/^6(?:011|5)/.test(cleaned)) return 'discover';
        return null;
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        const brand = detectCardBrand(e.target.value);
        setCardBrand(brand);
        setFormData({ ...formData, cardNumber: formatted });
        if (errors.cardNumber) setErrors({ ...errors, cardNumber: null });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Valid card number required';
        if (!formData.expiryMonth || formData.expiryMonth < 1 || formData.expiryMonth > 12) newErrors.expiryMonth = 'Valid month required';
        if (!formData.expiryYear || formData.expiryYear.length !== 4) newErrors.expiryYear = 'Valid year required';
        if (!formData.cvv || formData.cvv.length < 3) newErrors.cvv = 'CVV required';
        if (!formData.cardHolder) newErrors.cardHolder = 'Cardholder name required';
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const mockAuthCode = 'AUTH_' + Math.random().toString(36).substr(2, 9);
        await addPaymentMethod(mockAuthCode, formData.email);
        if (onSuccess) onSuccess();
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <form onSubmit={handleSubmit} className="payment-method-form">
            <div className="form-group"><label>Card Number</label><input type="text" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleCardNumberChange} className={errors.cardNumber ? 'error' : ''} maxLength={19} /><div className="card-icons">{cardBrand && <CardBrandIcon brand={cardBrand} size={24} />}</div>{errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}</div>

            <div className="form-row">
                <div className="form-group"><label>Expiry Month</label><select value={formData.expiryMonth} onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })} className={errors.expiryMonth ? 'error' : ''}><option value="">MM</option>{months.map(m => (<option key={m} value={m}>{m.toString().padStart(2, '0')}</option>))}</select></div>
                <div className="form-group"><label>Expiry Year</label><select value={formData.expiryYear} onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })} className={errors.expiryYear ? 'error' : ''}><option value="">YYYY</option>{years.map(y => (<option key={y} value={y}>{y}</option>))}</select></div>
                <div className="form-group"><label>CVV</label><input type="password" placeholder="123" value={formData.cvv} onChange={(e) => setFormData({ ...formData, cvv: e.target.value })} className={errors.cvv ? 'error' : ''} maxLength={4} /></div>
            </div>

            <div className="form-group"><label>Cardholder Name</label><input type="text" placeholder="John Doe" value={formData.cardHolder} onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })} className={errors.cardHolder ? 'error' : ''} /></div>
            <div className="form-group"><label>Billing Email</label><input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={errors.email ? 'error' : ''} /></div>

            <div className="security-note"><FiLock /> Your payment information is secure and encrypted</div>

            <div className="form-actions"><button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button><button type="submit" className="submit-btn" disabled={loading}><FiCreditCard /> {loading ? 'Adding...' : 'Add Payment Method'}</button></div>
        </form>
    );
};

export default PaymentMethodForm;