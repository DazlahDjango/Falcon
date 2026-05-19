import React from 'react';
import PropTypes from 'prop-types';

export const PriceDisplay = ({ 
    amount, 
    currency = 'KES', 
    period = null,
    size = 'medium',
    strikethrough = false,
    className = ''
}) => {
    const sizes = {
        small: 'price-display-small',
        medium: 'price-display-medium',
        large: 'price-display-large',
        xlarge: 'price-display-xlarge',
    };

    const formattedAmount = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount / 100);

    return (
        <div className={`price-display ${sizes[size]} ${className}`}>
            {strikethrough ? (
                <span className="price-display-strikethrough">{formattedAmount}</span>
            ) : (
                <span className="price-display-amount">{formattedAmount}</span>
            )}
            {period && <span className="price-display-period">/{period}</span>}
        </div>
    );
};

PriceDisplay.propTypes = {
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    period: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    strikethrough: PropTypes.bool,
    className: PropTypes.string,
};

export default PriceDisplay;