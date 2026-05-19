import React from 'react';
import PropTypes from 'prop-types';

export const CurrencyFormatter = ({ 
    amount, 
    currency = 'KES',
    showSymbol = true,
    showCents = false,
    className = ''
}) => {
    const formatAmount = () => {
        const value = showCents ? amount / 100 : Math.floor(amount / 100);
        
        return new Intl.NumberFormat('en-KE', {
            style: showSymbol ? 'currency' : 'decimal',
            currency: showSymbol ? currency : undefined,
            minimumFractionDigits: showCents ? 2 : 0,
            maximumFractionDigits: showCents ? 2 : 0,
        }).format(showCents ? amount / 100 : value);
    };

    return <span className={`currency-formatter ${className}`}>{formatAmount()}</span>;
};

CurrencyFormatter.propTypes = {
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    showSymbol: PropTypes.bool,
    showCents: PropTypes.bool,
    className: PropTypes.string,
};

export default CurrencyFormatter;