import React from 'react';
import PropTypes from 'prop-types';

export const BillingCycleSelector = ({ value, onChange, showSavings = true }) => {
    const savings = 20; // 20% savings on yearly
    return (
        <div className="billing-cycle-selector">
            <button
                className={`billing-cycle-option ${value === 'monthly' ? 'billing-cycle-option-active' : ''}`}
                onClick={() => onChange('monthly')}
            >
                Monthly
            </button>
            <button
                className={`billing-cycle-option ${value === 'yearly' ? 'billing-cycle-option-active' : ''}`}
                onClick={() => onChange('yearly')}
            >
                Yearly
                {showSavings && value === 'yearly' && (
                    <span className="billing-cycle-option-savings">Save {savings}%</span>
                )}
            </button>
        </div>
    );
};

BillingCycleSelector.propTypes = {
    value: PropTypes.oneOf(['monthly', 'yearly']).isRequired,
    onChange: PropTypes.func.isRequired,
    showSavings: PropTypes.bool,
};

export default BillingCycleSelector;