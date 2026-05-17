/**
 * Payment Utilities
 * Payment processing helper functions
 */

import { formatCurrency } from './formatters';

/**
 * Get payment method icon
 * @param {string} methodType - Type of payment method
 * @param {string} cardBrand - Card brand for card payments
 * @returns {string} Icon emoji or character
 */
export const getPaymentMethodIcon = (methodType, cardBrand = null) => {
    const icons = {
        card: '💳',
        bank: '🏦',
        ussd: '📱',
        qr: '📷',
        mobile_money: '💰',
    };
    
    if (methodType === 'card' && cardBrand) {
        const cardIcons = {
            visa: '💳',
            mastercard: '💳',
            'american express': '💳',
            discover: '💳',
        };
        return cardIcons[cardBrand.toLowerCase()] || '💳';
    }
    
    return icons[methodType] || '💳';
};

/**
 * Get payment method display name
 * @param {Object} method - Payment method object
 * @returns {string} Display name
 */
export const getPaymentMethodDisplayName = (method) => {
    if (!method) return 'Unknown';
    
    if (method.payment_type === 'card') {
        const brand = method.card_brand?.charAt(0).toUpperCase() + method.card_brand?.slice(1);
        const last4 = method.card_last4;
        return `${brand || 'Card'} •••• ${last4 || '****'}`;
    }
    
    if (method.payment_type === 'bank') {
        return `${method.bank_name || 'Bank'} - ${method.account_name || 'Account'}`;
    }
    
    return method.payment_type?.charAt(0).toUpperCase() + method.payment_type?.slice(1) || 'Payment Method';
};

/**
 * Check if card is expired
 * @param {Object} method - Payment method with expiry data
 * @returns {boolean} True if expired
 */
export const isCardExpired = (method) => {
    if (!method || method.payment_type !== 'card') return false;
    if (!method.card_expiry_year || !method.card_expiry_month) return false;
    
    const expiryDate = new Date(
        parseInt(method.card_expiry_year),
        parseInt(method.card_expiry_month) - 1,
        1
    );
    return expiryDate < new Date();
};

/**
 * Get days until card expiry
 * @param {Object} method - Payment method with expiry data
 * @returns {number} Days until expiry (-1 if expired, null if no expiry)
 */
export const getDaysUntilCardExpiry = (method) => {
    if (!method || method.payment_type !== 'card') return null;
    if (!method.card_expiry_year || !method.card_expiry_month) return null;
    
    const expiryDate = new Date(
        parseInt(method.card_expiry_year),
        parseInt(method.card_expiry_month) - 1,
        1
    );
    const now = new Date();
    
    if (expiryDate < now) return -1;
    
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Generate payment reference
 * @param {string} prefix - Reference prefix
 * @returns {string} Unique reference
 */
export const generatePaymentReference = (prefix = 'PAY') => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
};

/**
 * Calculate payment processing fee
 * @param {number} amount - Amount in cents
 * @param {string} paymentMethod - Payment method type
 * @returns {number} Fee amount in cents
 */
export const calculateProcessingFee = (amount, paymentMethod = 'card') => {
    const fees = {
        card: 0.025, // 2.5%
        bank: 0.01,  // 1%
        mobile_money: 0.02, // 2%
        ussd: 0.01,  // 1%
    };
    
    const rate = fees[paymentMethod] || 0.025;
    return Math.ceil(amount * rate);
};

/**
 * Format payment amount for display with fee breakdown
 * @param {number} amount - Amount in cents
 * @param {string} paymentMethod - Payment method type
 * @returns {Object} Breakdown of amounts
 */
export const getPaymentBreakdown = (amount, paymentMethod = 'card') => {
    const fee = calculateProcessingFee(amount, paymentMethod);
    const netAmount = amount - fee;
    
    return {
        gross: amount,
        fee,
        net: netAmount,
        grossDisplay: formatCurrency(amount),
        feeDisplay: formatCurrency(fee),
        netDisplay: formatCurrency(netAmount),
    };
};

/**
 * Validate webhook signature (frontend helper)
 * @param {string} signature - Signature from headers
 * @param {string} payload - Raw payload
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if valid
 */
export const validateWebhookSignature = async (signature, payload, secret) => {
    // This would typically be done on the backend
    // Frontend version for reference only
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    
    return computedSignature === signature;
};