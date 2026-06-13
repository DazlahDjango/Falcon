import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiCreditCard, FiCalendar } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './subscription.css';

export const SubscriptionCard = ({ subscription }) => {
    const navigate = useNavigate();

    const handleView = () => navigate(`/billing/subscriptions/${subscription.id}`);

    return (
        <div className="subscription-card-item" onClick={handleView}>
            <div className="subscription-card-header">
                <div className="subscription-card-plan">
                    <h3>{subscription.plan?.name}</h3>
                    <StatusBadge type="subscription" status={subscription.status} size="sm" />
                </div>
                <button className="subscription-card-view" onClick={(e) => { e.stopPropagation(); handleView(); }}><FiEye /></button>
            </div>
            <div className="subscription-card-body">
                <div className="subscription-card-price"><CurrencyFormatter amount={subscription.amount} currency={subscription.currency} /><span>/{subscription.billing_interval}</span></div>
                <div className="subscription-card-dates"><FiCalendar /> {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}</div>
                {subscription.auto_renew && <div className="subscription-card-renewal"><FiCreditCard /> Auto-renewal enabled</div>}
                {subscription.cancel_at_period_end && <div className="subscription-card-cancellation">Cancels at period end</div>}
            </div>
        </div>
    );
};

export default SubscriptionCard;