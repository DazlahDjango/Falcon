import React from 'react';
import { FiTrash2, FiStar, FiCreditCard, FiDollarSign, FiSmartphone, FiCalendar } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from 'react-icons/fa';
import { Building } from 'lucide-react';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { StatusBadge } from '../shared/StatusBadge';
import { CardBrandIcon } from '../shared/CardBrandIcon';
import { DefaultPaymentMethodBadge } from './DefaultPaymentMethodBadge';
import './payment-methods.css';

export const PaymentMethodCard = ({ method, isDefault, onSetDefault, onDelete, canManage = true }) => {
    const getMethodIcon = () => {
        if (method.payment_type === 'card') return <CardBrandIcon brand={method.card_brand} size={32} />;
        if (method.payment_type === 'bank') return <MdAccountBalanceWallet className="method-icon-bank" />;
        if (method.payment_type === 'mobile_money') return <FiSmartphone className="method-icon-mobile" />;
        return <FiCreditCard className="method-icon-default" />;
    };

    const getMethodDetails = () => {
        if (method.payment_type === 'card') {
            return (
                <>
                    <div className="method-detail"><span className="detail-label">Card Number</span><span className="detail-value">•••• {method.card_last4}</span></div>
                    <div className="method-detail"><span className="detail-label">Expires</span><span className="detail-value">{method.card_expiry_month}/{method.card_expiry_year}</span></div>
                    {method.card_brand && <div className="method-detail"><span className="detail-label">Brand</span><span className="detail-value capitalize">{method.card_brand}</span></div>}
                </>
            );
        }
        if (method.payment_type === 'bank') {
            return (
                <>
                    <div className="method-detail"><span className="detail-label">Bank Name</span><span className="detail-value">{method.bank_name || 'N/A'}</span></div>
                    <div className="method-detail"><span className="detail-label">Account Name</span><span className="detail-value">{method.account_name || 'N/A'}</span></div>
                </>
            );
        }
        return (
            <>
                <div className="method-detail"><span className="detail-label">Provider</span><span className="detail-value">{method.provider || 'Mobile Money'}</span></div>
                <div className="method-detail"><span className="detail-label">Account</span><span className="detail-value">{method.account_name || method.email}</span></div>
            </>
        );
    };

    const isExpired = method.is_expired_status?.is_expired;

    return (
        <div className={`payment-method-card ${isExpired ? 'expired' : ''} ${isDefault ? 'default' : ''}`}>
            <div className="method-card-header">
                <div className="method-icon">{getMethodIcon()}</div>
                <div className="method-badges">
                    {isDefault && <DefaultPaymentMethodBadge />}
                    {isExpired && <StatusBadge type="payment_method" status="expired" size="sm" />}
                    {method.status === 'active' && !isDefault && !isExpired && <StatusBadge type="payment_method" status="active" size="sm" />}
                </div>
            </div>

            <div className="method-card-body">
                <div className="method-display-name">{method.display_name || `${method.payment_type} ending in ${method.card_last4 || '****'}`}</div>
                <div className="method-details">{getMethodDetails()}</div>
                {method.email && <div className="method-email"><span className="detail-label">Email</span><span className="detail-value">{method.email}</span></div>}
            </div>

            {canManage && (
                <div className="method-card-footer">
                    {!isDefault && !isExpired && <button className="method-action set-default" onClick={onSetDefault}><FiStar /> Set as Default</button>}
                    <button className="method-action delete" onClick={onDelete}><FiTrash2 /> Remove</button>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodCard;