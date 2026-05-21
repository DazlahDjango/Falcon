import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRouteConstants';
import { renderBillingIcon } from '../shared/BillingIcons';

export const TrialBanner = ({ daysRemaining, onUpgrade }) => {
    if (daysRemaining <= 0) return null;

    const getMessage = () => {
        if (daysRemaining === 1) return 'Your trial ends tomorrow!';
        if (daysRemaining <= 3) return `Your trial ends in ${daysRemaining} days!`;
        return `Your trial ends in ${daysRemaining} days`;
    };

    const getSeverity = () => {
        if (daysRemaining <= 3) return 'warning';
        return 'info';
    };

    return (
        <div className={`trial-banner trial-banner-${getSeverity()}`}>
            <div className="trial-banner-content">
                <span className="trial-banner-icon">{renderBillingIcon('pending', { size: 24 })}</span>
                <div className="trial-banner-text">
                    <strong>{getMessage()}</strong>
                    <span>Upgrade now to continue using all features.</span>
                </div>
            </div>
            <div className="trial-banner-actions">
                <Link to={BILLING_ROUTES.PLANS} className="trial-banner-btn" onClick={onUpgrade}>
                    Upgrade Now
                </Link>
            </div>
        </div>
    );
};

TrialBanner.propTypes = {
    daysRemaining: PropTypes.number.isRequired,
    onUpgrade: PropTypes.func,
};

export default TrialBanner;