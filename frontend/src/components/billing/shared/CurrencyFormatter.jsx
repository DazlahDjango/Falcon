import React from 'react';
import './shared.css';

const CURRENCY_CONFIG = {
    KES: { symbol: 'KSh', locale: 'sw-KE', decimal: 2 },
    USD: { symbol: '$', locale: 'en-US', decimal: 2 },
    GBP: { symbol: '£', locale: 'en-GB', decimal: 2 },
    EUR: { symbol: '€', locale: 'de-DE', decimal: 2 },
    NGN: { symbol: '₦', locale: 'en-NG', decimal: 2 },
    GHS: { symbol: '₵', locale: 'en-GH', decimal: 2 },
    ZAR: { symbol: 'R', locale: 'en-ZA', decimal: 2 },
    XOF: { symbol: 'CFA', locale: 'fr-CI', decimal: 0 },
};

export const CurrencyFormatter = ({ amount, currency = 'KES', showSymbol = true, showCents = true, className = '' }) => {
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.KES;
    const amountInCents = typeof amount === 'number' ? amount : 0;
    const mainAmount = amountInCents / 100;
    const formatted = showCents ? mainAmount.toFixed(config.decimal) : Math.floor(mainAmount).toString();

    if (showSymbol) {
        return <span className={`currency-formatter ${className}`}>{config.symbol} {formatted}</span>;
    }

    try {
        const localeFormatted = new Intl.NumberFormat(config.locale, { style: 'currency', currency, minimumFractionDigits: showCents ? config.decimal : 0, maximumFractionDigits: showCents ? config.decimal : 0 }).format(mainAmount);
        return <span className={`currency-formatter ${className}`}>{localeFormatted}</span>;
    } catch {
        return <span className={`currency-formatter ${className}`}>{config.symbol} {formatted}</span>;
    }
};

export const formatCurrency = (amount, currency = 'KES') => {
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.KES;
    return `${config.symbol} ${(amount / 100).toFixed(config.decimal)}`;
};

export default CurrencyFormatter;