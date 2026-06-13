import React from 'react';
import { FiInfo } from 'react-icons/fi';
import CurrencyFormatter from './CurrencyFormatter';
import './shared.css';

export const PriceDisplay = ({ price, yearlyPrice, currency = 'KES', showYearly = true, showSavings = true, className = '' }) => {
    const monthlyPrice = price;
    const yearlyPriceValue = yearlyPrice || price * 10;
    const savings = showSavings && yearlyPrice ? ((price * 12) - yearlyPrice) / 100 : 0;
    const savingsPercent = showSavings && yearlyPrice ? Math.round(((price * 12) - yearlyPrice) / (price * 12) * 100) : 0;

    return (
        <div className={`price-display ${className}`}>
            <div className="price-display-monthly">
                <CurrencyFormatter amount={monthlyPrice} currency={currency} />
                <span className="price-display-period">/month</span>
            </div>
            {showYearly && yearlyPriceValue && (
                <div className="price-display-yearly">
                    <CurrencyFormatter amount={yearlyPriceValue} currency={currency} />
                    <span className="price-display-period">/year</span>
                    {savings > 0 && (
                        <span className="price-display-savings">
                            <FiInfo className="savings-icon" />
                            Save {formatCurrency(savings, currency)} ({savingsPercent}%)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default PriceDisplay;