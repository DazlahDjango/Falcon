import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../shared/StatusBadge';
import { PriceDisplay } from '../shared/PriceDisplay';

export const SubscriptionCard = ({ subscription }) => {
    const isExpiringSoon = subscription.is_active_status?.days_until_expiry <= 7 && 
                          subscription.is_active_status?.days_until_expiry > 0;

    return (
        <Link to={`/subscriptions/${subscription.id}`} className="subscription-card">
            <div className="subscription-card-header">
                <div className="subscription-card-plan">
                    <h3 className="subscription-card-plan-name">{subscription.plan?.name}</h3>
                    <StatusBadge status={subscription.status} size="small" />
                </div>
                <PriceDisplay 
                    amount={subscription.amount} 
                    period={subscription.billing_interval}
                    size="small"
                />
            </div>

            <div className="subscription-card-body">
                <div className="subscription-card-dates">
                    <div className="subscription-card-date">
                        <span>Started:</span>
                        <span>{new Date(subscription.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="subscription-card-date">
                        <span>Renews:</span>
                        <span className={isExpiringSoon ? 'subscription-card-date-warning' : ''}>
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="subscription-card-footer">
                <span className="subscription-card-link">View Details →</span>
            </div>
        </Link>
    );
};

SubscriptionCard.propTypes = {
    subscription: PropTypes.object.isRequired,
};

export default SubscriptionCard;