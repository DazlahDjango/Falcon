/**
 * Billing Formatters
 * Currency, date, and number formatting utilities
 */

/**
 * Format amount from cents to currency string
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (KES, USD, etc.)
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES', showSymbol = true) => {
    if (!amount && amount !== 0) return '—';
    
    const value = amount / 100;
    
    if (showSymbol) {
        const symbols = { KES: 'KSh', USD: '$', GBP: '£', EUR: '€' };
        const symbol = symbols[currency] || currency;
        return `${symbol} ${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    }
    
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};

/**
 * Format amount from cents to currency string (shorthand)
 * @param {number} amount - Amount in cents
 * @returns {string} Formatted currency string
 */
export const formatMoney = (amount) => {
    return formatCurrency(amount, 'KES', true);
};

/**
 * Format date for billing display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'datetime', 'relative'
 * @returns {string} Formatted date string
 */
export const formatBillingDate = (date, format = 'short') => {
    if (!date) return '—';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    switch (format) {
        case 'short':
            return d.toLocaleDateString();
        case 'long':
            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        case 'datetime':
            return d.toLocaleString();
        case 'relative':
            const now = new Date();
            const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays < 7) return `In ${diffDays} days`;
            return d.toLocaleDateString();
        default:
            return d.toLocaleDateString();
    }
};

/**
 * Format card number for display
 * @param {string} cardNumber - Full card number or last 4 digits
 * @returns {string} Masked card number
 */
export const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
};

/**
 * Format invoice number for display
 * @param {string} invoiceNumber - Raw invoice number
 * @returns {string} Formatted invoice number
 */
export const formatInvoiceNumber = (invoiceNumber) => {
    if (!invoiceNumber) return '';
    const parts = invoiceNumber.split('-');
    if (parts.length === 3) {
        return `${parts[0]}-${parts[1]}`;
    }
    return invoiceNumber;
};

/**
 * Format percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === undefined || value === null) return '—';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format phone number for billing
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Kenyan format: 07XX XXX XXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('07')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};