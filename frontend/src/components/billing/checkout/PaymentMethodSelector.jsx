import React, { useState } from 'react';
import { FiCreditCard, FiSmartphone, FiBank, FiQrCode, FiCheck, FiPlus } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import { usePaymentMethods } from '../../../hooks/billing/usePaymentMethods';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { CardBrandIcon } from '../shared/CardBrandIcon';
import './checkout.css';

export const PaymentMethodSelector = ({ selectedMethod, onSelect, showAddNew = true, amount = null }) => {
    const { paymentMethods, loading, addPaymentMethod } = usePaymentMethods({ autoFetch: true });
    const [showAddForm, setShowAddForm] = useState(false);
    const [adding, setAdding] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

    const activeMethods = paymentMethods.filter(m => m.status === 'active' || m.status === 'default');
    const defaultMethod = activeMethods.find(m => m.is_default);

    const handleAddCard = async () => {
        setAdding(true);
        await addPaymentMethod('AUTH_' + Math.random().toString(36).substr(2, 9), 'user@example.com');
        setAdding(false);
        setShowAddForm(false);
    };

    const getMethodIcon = (method) => {
        if (method.payment_type === 'card') return <CardBrandIcon brand={method.card_brand} size={24} />;
        if (method.payment_type === 'mobile_money') return <FiSmartphone />;
        if (method.payment_type === 'bank') return <FiBank />;
        return <FiCreditCard />;
    };

    return (
        <div className="payment-method-selector">
            <h4>Payment Method</h4>
            {loading ? <div className="payment-methods-loading"><div className="skeleton skeleton-line"></div><div className="skeleton skeleton-line"></div></div> : (
                <div className="payment-methods-list">
                    {activeMethods.map(method => (
                        <div key={method.id} className={`payment-method-item ${selectedMethod?.id === method.id ? 'selected' : ''}`} onClick={() => onSelect(method)}>
                            <div className="payment-method-radio"><div className={`radio-circle ${selectedMethod?.id === method.id ? 'checked' : ''}`}>{selectedMethod?.id === method.id && <FiCheck />}</div></div>
                            <div className="payment-method-icon">{getMethodIcon(method)}</div>
                            <div className="payment-method-info"><div className="method-name">{method.display_name}</div>{method.is_default && <span className="default-badge">Default</span>}</div>
                            {amount && <div className="payment-method-amount"><CurrencyFormatter amount={amount} /></div>}
                        </div>
                    ))}
                </div>
            )}

            {showAddNew && (
                <div className="add-payment-method">
                    {!showAddForm ? (
                        <button className="add-method-btn" onClick={() => setShowAddForm(true)}><FiPlus /> Add New Payment Method</button>
                    ) : (
                        <div className="add-card-form">
                            <div className="card-input-group"><label>Card Number</label><input type="text" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} /></div>
                            <div className="card-row"><div className="card-input-group"><label>Expiry Date</label><input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} /></div><div className="card-input-group"><label>CVV</label><input type="password" placeholder="123" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} /></div></div>
                            <div className="card-actions"><button className="cancel-card-btn" onClick={() => setShowAddForm(false)}>Cancel</button><button className="add-card-btn" onClick={handleAddCard} disabled={adding}>{adding ? 'Adding...' : 'Add Card'}</button></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;